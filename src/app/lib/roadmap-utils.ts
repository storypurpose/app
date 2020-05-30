import * as _ from 'lodash';
import { CustomNodeTypes, isCustomNode } from './jira-tree-utils';

export function populateMetadata(records) {
    const withDates = _.map(records, (record) => {
        //record.statistics = populateStatistics(record)
        const dateRange: any = {};
        if (record) {
            if (!record.created) {
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

export function transformToTreeChildren(children, timespanLookup) {
    if (!children) {
        return [];
    }
    children = _.orderBy(children, 'created');
    return _.map(children, (ec) => {
        const record: any = _.pick(ec, ['label', 'title', 'icon', 'key', 'issueType', 'status', 'timespan', 'created', 'duedate', 'resolution']);
        record.label = record.title;
        record.title = prepareTitle(record);
        const created = ec && ec.created ? new Date(ec.created) : new Date();
        let duedate = created;
        record.missingDuedate = true;
        record.duedatePassed = false;
        if (ec && ec.duedate) {
            duedate = new Date(ec.duedate);
            record.missingDuedate = false;
            record.duedatePassed = !ec.resolution && duedate <= new Date();
        }
        record.timespan = _.map(timespanLookup, (ts) => {
            return {
                idx: ts.idx,
                isInTimespan: !isCustomNode(record) &&
                    created <= ts.lastDate &&
                    ((duedate >= ts.firstDate && duedate <= ts.lastDate) || duedate > ts.lastDate)
            };
        });
        const result: any = { data: record };
        if (ec && ec.children && ec.children.length > 0) {
            result.children = transformToTreeChildren(ec.children, timespanLookup);
            if (result.data) {
                result.data.isHeading = true;
            }
            result.expanded = true;
            result.leaf = false;
        }
        if (ec && ec.issueType === CustomNodeTypes.Epic) {
            result.leaf = false;
        }
        return result;
    });
}

function prepareTitle(node: any) {
    const created = node.created ? toShortDate(new Date(node.created)) + ' -> ' : 'Missing created date'
    const duedate = node.updated ? toShortDate(new Date(node.duedate)) : ' Missing duedate'
    const key = node.key ? node.key + ": " : '';
    const status = node.status ? `[${node.status}]` : '';
    const resolution = node.resolution ? `[${node.resolution}]` : 'UNRESOLVED';
    return `${key} ${node.title} ${status} ${created} ${duedate} ${resolution}`;
}

function toShortDate(date) {
    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
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
        isWideRange,
        statistics: { missingDuedates: 0, duedatePassed: 0, unresolved: 0 }
    }
}
