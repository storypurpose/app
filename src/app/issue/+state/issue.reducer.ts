import * as _ from 'lodash';
import { Issue } from './issue.state';
import { ActionTypes } from './issue.actions';
import { CustomNodeTypes, searchTreeByKey, populateFieldValuesCompact, getIssueLinks, populatedFieldList } from 'src/app/lib/jira-tree-utils';

export function issueReducer(state: Issue, action: any): Issue {
    switch (action.type) {
        case ActionTypes.LoadIssueDetails: {
            return { ...state, issueDetails: null, currentIssueKey: action.payload };
        }

        case ActionTypes.LoadIssueDetailsSuccess: {
            const issueDetails: any = populateFieldValuesCompact(action.payload.issue);
            if (issueDetails) {
                issueDetails.organization = action.payload.organization;
                issueDetails.projectConfig = action.payload.projectConfig;
                issueDetails.projectConfigLoaded = action.payload.projectConfig ? true : false;
                issueDetails.relatedLinks = getIssueLinks(action.payload.issue);
            }
            return { ...state, currentIssueKey: action.payload, issueDetails };
        }

        case ActionTypes.LoadEpicChildrenSuccess: {
            const epicChildren = _.map(action.payload.issues, p => populateFieldValuesCompact(p));
            return {
                ...state, issueDetails: {
                    ...state.issueDetails, epicChildrenLoaded: true, epicChildren
                }
            };
        }
        case ActionTypes.LoadRelatedLinksSuccess: {
            const relatedLinks = populateRelatedLinks(state, action);
            return {
                ...state, issueDetails: {
                    ...state.issueDetails, relatedLinksLoaded: true, relatedLinks
                }
            };
        }
        case ActionTypes.LoadProjectDetailsSuccess: {
            const projectConfig = populateProjectDetails(action.payload);
            return {
                ...state, issueDetails: {
                    ...state.issueDetails, projectConfigLoaded: true, projectConfig
                }
            };
        }

        case ActionTypes.SetSelectedItem: {
            return { ...state, selectedItem: action.payload };
        }

        case ActionTypes.SetPurpose: {
            return { ...state, purpose: action.payload };
        }
        case ActionTypes.UpdateOrganizationPurpose: {
            const payload = action.payload || {};
            return {
                ...state, purpose:
                    state.purpose.map((record) => record.issueType === CustomNodeTypes.Organization
                        ? { ...record, key: payload.name, title: payload.name, purpose: payload.purpose }
                        : record)

            };
        }

        case ActionTypes.SetRecentlyViewed: {
            return { ...state, recentmostItem: action.payload };
        }

        case ActionTypes.UpdateFieldValue: {
            return { ...state, updatedField: null }
        }

        case ActionTypes.UpdateFieldValueSuccess: {
            const selectedItem = state.selectedItem;
            const updatedField = action.payload;
            const found = searchTreeByKey(selectedItem, updatedField.issueKey);
            if (found) {
                if (updatedField.fieldName === 'title') {
                    found.title = updatedField.updatedValue;
                } else if (updatedField.fieldName === 'fixVersions')
                    found.fixVersions = _.map(updatedField.updatedValue, v => v.name);
            }
            return { ...state, updatedField, selectedItem };
        }

        default: return state;
    }
}

function populateProjectDetails(project) {
    const currentProject: any = _.pick(project, ['id', 'key', 'description', 'name', 'customFields']);
    currentProject.hierarchy = [];
    if (project.issueTypes) {
        currentProject.standardIssueTypes = getIssueTypes(project.issueTypes, false);
        currentProject.subTaskIssueTypes = getIssueTypes(project.issueTypes, true);
    }
    currentProject.metadata = {};
    if (project.components) {
        currentProject.metadata.components =
            _.sortBy(_.map(project.components, (ff) => _.pick(ff, ['id', 'name'])), ['name']);
    }
    if (project.versions) {
        currentProject.metadata.versions =
            _.sortBy(_.map(project.versions, (ff) => _.pick(ff, ['archived', 'id', 'name', 'releaseDate'])), ['name']);
    }

    return currentProject;
}

function getIssueTypes(list, isSubTask): any {
    return _.map(_.filter(list, { subtask: isSubTask }), (it) => {
        return { name: it.name, list: [] }
    });
}

function populateRelatedLinks(state: Issue, action: any) {
    const relatedLinks = state.issueDetails.relatedLinks;
    if (action.payload && action.payload.issues) {
        const records = _.map(action.payload.issues, (item) => _.pick(populateFieldValuesCompact(item), populatedFieldList));
        relatedLinks.forEach(u => {
            const found = _.find(records, { key: u.key });
            if (found) {
                u.project = found.project;
                u.labels = found.labels;
                u.fixVersions = found.fixVersions;
                u.components = found.components;
            }
        });
    }
    return relatedLinks;
}

