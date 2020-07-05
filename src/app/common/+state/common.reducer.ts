import * as _ from 'lodash';
import { Common } from './common.state';
import * as jiraTreeUtil from 'src/app/lib/jira-tree-utils';
import { ActionTypes } from './common.actions';

export function commonReducer(state: Common, action: any): Common {
    switch (action.type) {
        case ActionTypes.LoadComments: {
            return { ...state, comments: null };
        }
        case ActionTypes.LoadCommentsSuccess: {
            let records = action.payload;
            let total = 0;
            if (action.payload && action.payload.comments) {
                total = action.payload.total;
                records = jiraTreeUtil.flattenComments(action.payload.comments);
            }
            return { ...state, comments: { total, records } };
        }

        case ActionTypes.AddCommentSuccess: {
            const comments = state.comments || { total: 0, records: [] };
            comments.total = comments.total + 1;
            const comment = jiraTreeUtil.flattenSingleComment(action.payload);
            comments.records.push(comment);
            return {
                ...state, comments: {
                    ...state.comments, total: comments.total, records: comments.records
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
        case ActionTypes.LoadIssueLinkTypesSuccess: {
            return { ...state, issueLinkTypes: action.payload };
        }
        case ActionTypes.LoadCreateIssueMetadataSuccess: {
            return { ...state, createIssueMetadata: action.payload };
        }

        default: return state;
    }
}

