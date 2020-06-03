import * as _ from 'lodash';

export const DEFAULT_STARTDATE_FIELD = { id: 'created', name: 'created' };

export function getExtendedFields(projects, projectKey, issueType) {
    const projectConfig = _.find(projects, { key: projectKey });
    if (projectConfig && projectConfig.standardIssueTypes) {
        const issueTypeConfig = _.find(projectConfig.standardIssueTypes, { name: issueType });
        return (issueTypeConfig) ? issueTypeConfig.list || [] : [];
    }
}

export function populateAllExtendedFields(projects: any) {
    return _.uniqBy(_.union(
        _.flatten(_.map(projects, 'hierarchy')),
        _.map(projects, 'startdate') || [],
        _.filter(_.flatten(_.map(projects, 'customFields')), { name: "Epic Link" })
    ), 'id');
}
export function initStartdateField(projects) {
    if (projects) {
        projects.forEach(project => project.startdate = project.startdate || DEFAULT_STARTDATE_FIELD)
    }
}

