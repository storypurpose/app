import * as _ from 'lodash';

export const NO_COMPONENT = 'No component';
export const BACKLOG_SPRINT = 'Backlog';

export function initializeMetadata() {
    return {
        count: 0,
        noComponentCount: 0,
        backlogCount: 0,

        labels: [],
        components: [],
        fixVersions: []
    }
}

export function mergeMetadata(left: any, right: any) {
    left.count += right.count;
    left.noComponentCount += right.noComponentCount;
    left.backlogCount += right.backlogCount;

    left.labels = _.union(left.labels, right.labels);
    left.components = _.union(left.components, right.components);
    left.fixVersions = _.union(left.fixVersions, right.fixVersions);
}

export function extractMetadata(records) {
    const record: any = initializeMetadata();
    if (records) {
        record.count = records ? records.length : 0;
        record.labels = _.union(_.flatten(_.map(records, p => p.labels)));
        record.components = _.orderBy(_.map(_.union(_.flatten(
            _.map(records, p => p.components))), (c) => { return { title: c, count: 0 }; }), 'title');
        record.components.unshift({ title: NO_COMPONENT, count: 0 });
        record.fixVersions = _.map(_.union(_.flatten(_.map(records, p => p.fixVersions))), (fv) => {
            const found = _.filter(records, p => _.includes(p.fixVersions, fv));
            return {
                title: fv, expanded: true, count: found ? found.length : 0,
                componentWise: _.map(record.components, c => {
                    const values = _.filter(found, f => (c.title === NO_COMPONENT)
                        ? f.components.length === 0
                        : _.includes(f.components, c.title));
                    c.count += values.length;
                    return {
                        component: c.title,
                        values: values
                    };
                })
            };
        });
        record.fixVersions = _.orderBy(record.fixVersions, ['title'])
        const noComponent = _.find(record.components, { title: NO_COMPONENT });
        if (!noComponent || noComponent.count === 0) {
            _.remove(record.components, { title: NO_COMPONENT });
        } else {
            record.noComponentCount = noComponent.count;
        }
        const backlogFixVersion = _.find(record.fixVersions, { title: BACKLOG_SPRINT });
        if (backlogFixVersion) {
            record.backlogCount = backlogFixVersion.count;
        }
    }
    return record;
}

export function populateStatistics(record) {
    const statusResultSet = _.mapValues(_.groupBy(_.map(record.children, 'status')), (s) => s.length);
    const issueTypeResultSet = _.mapValues(_.groupBy(_.map(record.children, 'issueType')), (s) => s.length);

    return {
        components: _.map(record.metadata.components, c => { return { key: c.title, count: c.count } }),
        status: Object.keys(statusResultSet).map((key) => { return { key, count: statusResultSet[key] }; }),
        issueTypes: Object.keys(issueTypeResultSet).map((key) => { return { key, count: issueTypeResultSet[key] }; })
    };
}


