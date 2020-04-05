import * as _ from 'lodash';

export function getExtendedFields(projects, projectKey, issueType) {
    const projectConfig = _.find(projects, { key: projectKey });
    if (projectConfig && projectConfig.standardIssueTypes) {
        const issueTypeConfig = _.find(projectConfig.standardIssueTypes, { name: issueType });
        return (issueTypeConfig) ? issueTypeConfig.list || [] : [];
    }
}

