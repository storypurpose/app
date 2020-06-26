import { Issue } from './issue.state';
import { ActionTypes } from './issue.actions';
import * as jiraTreeUtil from 'src/app/lib/jira-tree-utils';
import * as timelineUtil from 'src/app/lib/timeline-utils'
import * as _ from 'lodash'

export function issueReducer(state: Issue, action: any): Issue {
    switch (action.type) {
        case ActionTypes.LoadPrimaryIssue: {
            return { ...state, primaryIssue: null, primaryIssueKey: action.payload.issue };
        }

        case ActionTypes.LoadPrimaryIssueSuccess: {
            return { ...state, primaryIssue: populateIssueDetails(action.payload) };
        }

        case ActionTypes.LoadPrimaryIssueEpicChildren: {
            return { ...state, primaryIssue: { ...state.primaryIssue, epicChildrenLoading: true, epicChildrenLoaded: false } };
        }
        case ActionTypes.LoadPrimaryIssueEpicChildrenSuccess: {
            const epicChildren = _.map(action.payload.issues, p => jiraTreeUtil.populateFieldValuesCompact(p));
            return {
                ...state, primaryIssue: {
                    ...state.primaryIssue, epicChildrenLoading: false, epicChildrenLoaded: true, epicChildren
                }
            };
        }
        case ActionTypes.LoadPrimaryIssueRelatedLinks: {
            return { ...state, primaryIssue: { ...state.primaryIssue, relatedLinksLoading: true } };
        }
        case ActionTypes.LoadPrimaryIssueRelatedLinksSuccess: {
            const relatedLinks = populatePrimaryIssueRelatedLinks(state, action);
            return {
                ...state, primaryIssue: {
                    ...state.primaryIssue, relatedLinksLoading: false, relatedLinksLoaded: true, relatedLinks
                }
            };
        }

        case ActionTypes.SetHierarchicalIssue: {
            return { ...state, hierarchicalIssue: action.payload };
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

        case ActionTypes.LoadSubtasks: {
            return { ...state, subtasks: null };
        }

        case ActionTypes.LoadSubtasksSuccess: {
            let subtasks = null;
            if (action.payload && action.payload.result && action.payload.result.issues) {
                subtasks = jiraTreeUtil.flattenNodes(action.payload.result.issues);
                jiraTreeUtil.appendExtendedFields(subtasks, action.payload.extendedFields);
            }
            return { ...state, subtasks };
        }

        // case ActionTypes.LoadCommentsSuccess: {
        //     let records = action.payload;
        //     let total = 0;
        //     if (action.payload && action.payload.comments) {
        //         total = action.payload.total;
        //         records = jiraTreeUtil.flattenComments(action.payload.comments);
        //     }
        //     return { ...state, comments: { total, records } };
        // }

        case ActionTypes.LoadSelectedIssue: {
            return { ...state, selectedIssue: null, selectedIssueKey: action.payload.issue };
        }
        case ActionTypes.LoadSelectedIssueSuccess: {
            return { ...state, selectedIssue: populateIssueDetails(action.payload) };
        }
        case ActionTypes.PopulateIssueTimelineView: {
            const startdateCode = state.selectedIssue.projectConfig.startdate.id || 'created';
            const metadata = timelineUtil.populateMetadata(action.payload, startdateCode);
            const records = timelineUtil.transformToTreeChildren(action.payload, metadata.timespan, startdateCode, false);
            return { ...state, timelineView: { metadata, records } };
        }

        case ActionTypes.ChangeSelectedIssueView: {
            return { ...state, isSelectedIssueViewCompact: action.payload };
        }

        case ActionTypes.LoadSelectedIssueEpicChildren: {
            return { ...state, selectedIssue: { ...state.selectedIssue, epicChildrenLoading: true, epicChildrenLoaded: false } };
        }
        case ActionTypes.LoadSelectedIssueEpicChildrenSuccess: {
            const epicChildren = _.map(action.payload.issues, p => jiraTreeUtil.populateFieldValuesCompact(p));
            return {
                ...state, selectedIssue: {
                    ...state.selectedIssue, epicChildrenLoading: false, epicChildrenLoaded: true, epicChildren
                }
            };
        }
        case ActionTypes.LoadSelectedIssueRelatedLinks: {
            return { ...state, selectedIssue: { ...state.selectedIssue, relatedLinksLoading: true, relatedLinksLoaded: false } };
        }
        case ActionTypes.LoadSelectedIssueRelatedLinksSuccess: {
            const relatedLinks = _.map(action.payload.issues, p => jiraTreeUtil.populateFieldValuesCompact(p));
            const cached = state.selectedIssue.relatedLinks;
            relatedLinks.forEach((u: any) => {
                const found = _.find(cached, { key: u.key });
                u.linkType = (found) ? found.linkType : 'link';
            });
            return {
                ...state, selectedIssue: {
                    ...state.selectedIssue, relatedLinksLoading: false, relatedLinksLoaded: true, relatedLinks
                }
            };
        }

        case ActionTypes.SetSelectedIssue: {
            return { ...state, selectedIssue: action.payload };
        }

        case ActionTypes.SetPurpose: {
            return { ...state, purpose: action.payload };
        }
        case ActionTypes.UpdateOrganizationPurpose: {
            const payload = action.payload || {};
            const hierarchicalIssue = state.hierarchicalIssue;
            const treenode = jiraTreeUtil.searchTreeByIssueType(hierarchicalIssue, jiraTreeUtil.CustomNodeTypes.Organization);
            if (treenode) {
                treenode.label = payload.name;
                treenode.title = payload.name;
                treenode.description = payload.purpose;
            }
            return {
                ...state, hierarchicalIssue, purpose:
                    state.purpose.map((record) => record.issueType === jiraTreeUtil.CustomNodeTypes.Organization
                        ? { ...record, key: payload.name, label: payload.name, title: payload.name, purpose: payload.purpose }
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
            const updatedField = action.payload;
            return { ...state, updatedField };
        }

        case ActionTypes.UpdateOrganizationTitleSuccess: {
            return { ...state, primaryIssue: { ...state.primaryIssue, organization: action.payload } };
        }

        default: return state;
    }
}

function populateIssueDetails(payload: any) {
    const issueDetails: any = jiraTreeUtil.populateFieldValuesCompactWithExtendedFields(payload.issue, payload.extendedFields);
    if (issueDetails) {
        issueDetails.organization = payload.organization;
        issueDetails.projectConfig = payload.projectConfig;
        issueDetails.projectConfigLoaded = payload.projectConfig ? true : false;
        issueDetails.relatedLinks = jiraTreeUtil.getIssueLinks(payload.issue);

        issueDetails.epicChildrenLoading = false;
        issueDetails.epicChildrenLoaded = false;

        issueDetails.relatedLinksLoading = false;
        issueDetails.relatedLinksLoaded = false;
    }
    return issueDetails;
}

function populateProjectDetails(project) {
    const currentProject: any = _.pick(project, ['id', 'key', 'description', 'name', 'customFields', 'startdate']);
    currentProject.hierarchy = [];
    currentProject.storyboardFields = [];

    if (project.issueTypes) {
        currentProject.standardIssueTypes = getIssueTypes(project.issueTypes, false);
        currentProject.subTaskIssueTypes = getIssueTypes(project.issueTypes, true);
    }
    currentProject.metadata = {};
    if (project.components) {
        currentProject.metadata.components =
            _.sortBy(_.map(project.components, (ff) => _.pick(ff, ['id', 'name', 'description'])), ['name']);
    }
    if (project.versions) {
        currentProject.metadata.versions =
            _.sortBy(_.map(project.versions, (ff) => _.pick(ff, ['archived', 'id', 'name', 'releaseDate', 'description'])), ['name']);
    }

    return currentProject;
}

function getIssueTypes(list, isSubTask): any {
    return _.map(_.filter(list, { subtask: isSubTask }), (it) => {
        return { name: it.name, list: [] }
    });
}

function populatePrimaryIssueRelatedLinks(state: Issue, action: any) {
    if (!state.primaryIssue) {
        return null;
    }

    const relatedLinks = state.primaryIssue.relatedLinks;
    if (action.payload && action.payload.issues) {

        // const groupedIssueLinks = _.filter(state.primaryIssue.children, { issueType: CustomNodeTypes.RelatedLink });
        // groupedIssueLinks.forEach(gil => {
        //     gil.children.forEach(c => {

        //     })
        // })


        if (relatedLinks) {
            const records = _.map(action.payload.issues, (item) => _.pick(jiraTreeUtil.populateFieldValuesCompact(item), jiraTreeUtil.populatedFieldList));
            relatedLinks.forEach(u => {
                const found = _.find(records, { key: u.key });
                if (found) {
                    u.created = found.created;
                    u.duedate = found.duedate;
                    u.updated = found.updated;
                    u.resolution = found.resolution;

                    u.project = found.project;
                    u.labels = found.labels;
                    u.fixVersions = found.fixVersions;
                    u.components = found.components;
                }
            });
        }
    }

    return relatedLinks;
}

