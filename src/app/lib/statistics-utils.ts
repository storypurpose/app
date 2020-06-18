import * as _ from 'lodash';

export const EMPTY_RECORD = 'Unassigned';
export const BACKLOG_SPRINT = 'Backlog';

export function initializeMetadata(groupByColumn) {
    const metadata = {
        count: 0,
        emptyRecordCount: 0,
        backlogCount: 0,
        fixVersions: []
    }
    metadata[groupByColumn] = [];
    return metadata;
}

export function mergeMetadata(left: any, right: any, groupByColumn) {
    left.count += right.count;
    left.emptyRecordCount += right.emptyRecordCount;
    left.backlogCount += right.backlogCount;

    left[groupByColumn] = _.union(left[groupByColumn], right[groupByColumn]);
    left.fixVersions = _.union(left.fixVersions, right.fixVersions);
}

export function extractMetadata(records, groupByColumn) {
    const record: any = initializeMetadata(groupByColumn);
    if (records) {
        record.count = records ? records.length : 0;

        // record.labels = _.orderBy(_.map(_.union(_.flatten(
        //     _.map(records, p => p.labels))), (c) => { return { title: c, count: 0 }; }), 'title');
        // record.labels.unshift({ title: EMPTY_RECORD, count: 0 });

        record[groupByColumn] = _.orderBy(_.map(_.union(_.flatten(
            _.map(records, p => p[groupByColumn]))), (c) => { return { title: c, count: 0 }; }), 'title');
        record[groupByColumn].unshift({ title: EMPTY_RECORD, count: 0 });

        record.fixVersions = _.map(_.union(_.flatten(_.map(records, p => p.fixVersions))), (fv) => {
            const found = _.filter(records, p => _.includes(p.fixVersions, fv));

            let result: any = { title: fv, expanded: true, count: found ? found.length : 0 };

            result[groupByColumn] = _.map(record[groupByColumn], c => {
                const values = _.filter(found, f => (c.title === EMPTY_RECORD)
                    ? f[groupByColumn].length === 0
                    : _.includes(f[groupByColumn], c.title));
                c.count += values.length;
                return { key: c.title, values: values };
            })

            return result;
        });
        record.fixVersions = _.orderBy(record.fixVersions, ['title'])

        const emptyRecord = _.find(record[groupByColumn], { title: EMPTY_RECORD });
        if (!emptyRecord || emptyRecord.count === 0) {
            _.remove(record[groupByColumn], { title: EMPTY_RECORD });
        } else {
            record.emptyRecordCount = emptyRecord.count;
        }
        const backlogFixVersion = _.find(record.fixVersions, { title: BACKLOG_SPRINT });
        if (backlogFixVersion) {
            record.backlogCount = backlogFixVersion.count;
        }
    }
    return record;
}

export function populateStatistics(metadata, records, title = "Statistics", groupByColumn) {
    const statusResultSet = _.mapValues(_.groupBy(_.map(records, 'status')), (s) => s.length);
    const issueTypeResultSet = _.mapValues(_.groupBy(_.map(records, 'issueType')), (s) => s.length);
    const resolutionResultSet = _.mapValues(_.groupBy(_.map(records, 'resolution')), (s) => s.length);
    const total = records ? records.length : 0;
    const unresolved = _.filter(records, r => !r.resolution).length;

    const result = {
        title: `${title} / ${total - unresolved} Resolved`,
        total,
        unresolved,

        status: Object.keys(statusResultSet).map((key) => {
            return { key, count: statusResultSet[key] };
        }),
        issueTypes: Object.keys(issueTypeResultSet).map((key) => {
            return { key, count: issueTypeResultSet[key] };
        }),
        resolutions: Object.keys(resolutionResultSet).map((key) => {
            return { key: key === "null" ? 'Unresolved' : key, count: resolutionResultSet[key] };
        }),
        missingDueDates: _.filter(records, (c) => !c.duedate).length,
        duedatePassed: _.filter(records, (c) => !c.resolution && c.duedate && (new Date(c.duedate)) < (new Date())).length
    };

    result[groupByColumn] = _.map(metadata[groupByColumn], c => { return { key: c.title, count: c.count } })

    return result;
}

