import * as _ from 'lodash';
import { Issue } from './issue.state';
import { ActionTypes } from './issue.actions';
import {
    CustomNodeTypes, searchTreeByKey, populateFieldValuesCompact,
    getIssueLinks, populatedFieldList, getExtendedFieldValue
} from 'src/app/lib/jira-tree-utils';

export function issueReducer(state: Issue, action: any): Issue {
    switch (action.type) {
        case ActionTypes.LoadPrimaryIssue: {
            return { ...state, primaryIssue: null, primaryIssueKey: action.payload.issue };
        }

        case ActionTypes.LoadPrimaryIssueSuccess: {
            return { ...state, primaryIssue: populateIssueDetails(action.payload) };
        }

        case ActionTypes.LoadEpicChildren: {
            return { ...state, primaryIssue: { ...state.primaryIssue, epicChildrenLoading: true } };
        }
        case ActionTypes.LoadEpicChildrenSuccess: {
            const epicChildren = _.map(action.payload.issues, p => populateFieldValuesCompact(p));
            return {
                ...state, primaryIssue: {
                    ...state.primaryIssue, epicChildrenLoading: false, epicChildrenLoaded: true, epicChildren
                }
            };
        }
        case ActionTypes.LoadRelatedLinks: {
            return { ...state, primaryIssue: { ...state.primaryIssue, relatedLinksLoading: true } };
        }
        case ActionTypes.LoadRelatedLinksSuccess: {
            const relatedLinks = populateRelatedLinks(state, action);
            return {
                ...state, primaryIssue: {
                    ...state.primaryIssue, relatedLinksLoading: false, relatedLinksLoaded: true, relatedLinks
                }
            };
        }
        case ActionTypes.LoadProjectDetails: {
            return { ...state, primaryIssue: { ...state.primaryIssue, projectConfigLoading: true } };
        }
        case ActionTypes.LoadProjectDetailsSuccess: {
            const projectConfig = populateProjectDetails(action.payload);
            return {
                ...state, primaryIssue: {
                    ...state.primaryIssue, projectConfigLoading: false, projectConfigLoaded: true, projectConfig
                }
            };
        }

        case ActionTypes.LoadSelectedIssue: {
            return { ...state, selectedIssue: null, selectedIssueKey: action.payload.issue };
        }

        case ActionTypes.LoadSelectedIssueSuccess: {
            return { ...state, selectedIssue: populateIssueDetails(action.payload) };
        }

        case ActionTypes.SetSelectedItem: {
            return { ...state, selectedIssue: action.payload };
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
            const selectedItem = state.selectedIssue;
            const updatedField = action.payload;
            const found = searchTreeByKey(selectedItem, updatedField.issueKey);
            if (found) {
                if (updatedField.fieldName === 'title') {
                    found.title = updatedField.updatedValue;
                } else if (updatedField.fieldName === 'fixVersions')
                    found.fixVersions = _.map(updatedField.updatedValue, v => v.name);
            }
            return { ...state, updatedField, selectedIssue: selectedItem };
        }

        default: return state;
    }
}

function populateIssueDetails(payload: any) {
    const issueDetails: any = populateFieldValuesCompact(payload.issue);
    if (payload.extendedFields && payload.extendedFields.length > 0) {
        issueDetails.extendedFields = [];
        payload.extendedFields.forEach(field => {
            field.extendedValue = getExtendedFieldValue(payload.issue, field.id);
            issueDetails.extendedFields.push(field);
        });
    }
    if (issueDetails) {
        issueDetails.organization = payload.organization;
        issueDetails.projectConfig = payload.projectConfig;
        issueDetails.projectConfigLoaded = payload.projectConfig ? true : false;
        issueDetails.relatedLinks = getIssueLinks(payload.issue);
    }
    return issueDetails;
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
    const relatedLinks = state.primaryIssue.relatedLinks;
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

