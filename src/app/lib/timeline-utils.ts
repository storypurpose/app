import * as _ from 'lodash';
import { CustomNodeTypes, isCustomNode } from './jira-tree-utils';
import * as statsUtil from './statistics-utils';
import * as utils from './utils';

export function populateMetadata(records, startdateCode) {
    startdateCode = startdateCode || 'created';
    const withDates = _.map(records, (record) => {
        const createdValue = record[startdateCode] || record.created;
        const dateRange: any = { created: createdValue, duedate: record.duedate };
        if (record) {
            if (!createdValue) {
                const minCreated: any = _.minBy(_.union(record.children || []), 'created');
                if (minCreated) {
                    dateRange.created = minCreated.created;
                }
            }
            if (!record.duedate) {
                const maxDuedate: any = _.maxBy(_.union(record.children || []), 'duedate');
                if (maxDuedate) {
                    dateRange.duedate = maxDuedate.duedate;
                }
            }
        }
        return dateRange;
    });

    const minStartDateRecord: any = _.minBy(_.union(withDates || []), 'created');
    const minStartDate = minStartDateRecord && minStartDateRecord.created ? new Date(minStartDateRecord.created) : new Date();
    const maxDueDateRecord: any = _.maxBy(_.union(withDates || []), 'duedate');
    const maxDueDate = maxDueDateRecord && maxDueDateRecord.duedate ? new Date(maxDueDateRecord.duedate) : new Date();

    const metadata = initMetadata(minStartDate, maxDueDate);
    return metadata;
}

export function transformToTreeChildren(children, timespanLookup, startdateCode, expandEpic = false) {
    if (!children) {
        return [];
    }
    startdateCode = startdateCode || 'created';
    children = _.orderBy(children, startdateCode);
    return _.map(children, (ec) => {
        const record: any = _.pick(ec, ['label', 'title', 'icon', 'key', 'issueType', 'status', 'timespan', 'created', 'duedate', 'resolution', startdateCode]);
        record.label = record.title;
        record.missingStartdate = startdateCode !== 'created' && !ec[startdateCode];
        record.title = prepareTitle(record);
        const createdValue = ec[startdateCode] || ec.created;
        const created = ec && createdValue ? new Date(createdValue) : new Date();
        let duedate = created;
        record.missingDuedate = true;
        record.duedatePassed = false;
        if (ec && ec.duedate) {
            duedate = new Date(ec.duedate);
            record.missingDuedate = false;
            record.duedatePassed = duedate < new Date();
        }
        record.timespan = _.map(timespanLookup, (ts) => {
            return {
                idx: ts.idx,
                isInTimespan: !isCustomNode(record) &&
                    created <= ts.lastDate &&
                    ((duedate >= ts.firstDate && duedate <= ts.lastDate) || duedate > ts.lastDate)
            };
        });
        const groupByColumn = "components";
        const result: any = { data: record };
        if (ec && ec.children && ec.children.length > 0) {
            result.children = transformToTreeChildren(ec.children, timespanLookup, startdateCode, expandEpic);
            if (result.data) {
                result.data.isHeading = true;
                result.data.statistics = statsUtil.populateStatistics(statsUtil.extractMetadata(ec.children, groupByColumn), ec.children, record.label, groupByColumn);
                result.data.statistics.extended = populateExtendedStats(result.children);
            }
            result.expanded = true;
            result.leaf = false;
        }
        if (ec && ec.issueType === CustomNodeTypes.Epic && expandEpic) {
            result.leaf = false;
        }
        return result;
    });
}

function prepareTitle(node: any) {
    const datePrefix = node.missingStartdate ? 'CD:' : ''
    const created = node.created ? utils.toShortDate(new Date(node.created)) : 'No created date';
    const duedate = node.duedate ? utils.toShortDate(new Date(node.duedate)) : ' No duedate'
    const key = node.key ? node.key + ":" : '';
    const status = node.status ? `[${node.status}]` : '';
    const resolution = node.resolution ? `[${node.resolution}]` : 'UNRESOLVED';
    return `${key} ${node.title} ${status} [${datePrefix}${created} - ${duedate}] ${resolution}`;
}

function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

function getMonthwiseRange(startdate, noOfMonths) {
    return _.map(_.range(noOfMonths), (idx) => {
        const date = new Date(startdate);
        date.setMonth(date.getMonth() + idx);
        const year = date.getFullYear(), month = date.getMonth();
        const title = date.toLocaleString('default', { month: 'short', year: 'numeric' });

        return { idx, title, firstDate: new Date(year, month, 1), lastDate: new Date(year, month + 1, 0) };
    });
}

function initMetadata(startdate, enddate) {
    const noOfMonths = monthDiff(startdate, enddate);
    const isWideRange = noOfMonths > 50;
    return {
        fixedColumns: [{ title: 'key' }, { title: 'Issues' }, {}],
        timespan: getMonthwiseRange(startdate, isWideRange ? 50 : noOfMonths),
        isWideRange
    }
}

function populateExtendedStats(records) {

    const stats = { missingStartdates: 0, missingDuedates: 0, duedatePassed: 0 };

    _.map(_.map(records, 'data'), d => {
        stats.missingStartdates += d.missingStartdate ? 1 : 0;
        stats.missingDuedates += d.missingDuedate ? 1 : 0;
        stats.duedatePassed += !d.resolution && !d.duedatePassed ? 1 : 0;
        return d;
    })
    return [
        { title: "Missing startdates", value: stats.missingStartdates },
        { title: "Missing duedates", value: stats.missingDuedates },
        { title: "Duedate elapsed", value: stats.duedatePassed }
    ]
}