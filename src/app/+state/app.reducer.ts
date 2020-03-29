import * as _ from 'lodash';
import { App } from './app.state';
import { ActionTypes } from './app.actions';

export function appReducer(state: App, action: any): App {
    switch (action.type) {
        case ActionTypes.ShowConnectionEditor: {
            return { ...state, connectionEditorVisible: action.payload };
        }
        case ActionTypes.ShowCustomFieldEditor: {
            return { ...state, customFieldEditorVisible: action.payload };
        }
        case ActionTypes.ShowProjectConfigEditor: {
            return { ...state, projectConfigEditorVisible: action.payload };
        }
        case ActionTypes.SetCurrentIssueKey: {
            return { ...state, currentIssueKey: action.payload };
        }
        case ActionTypes.SetMode: {
            return { ...state, mode: action.payload };
        }

        case ActionTypes.SetConnectionDetails: {
            return { ...state, connectionDetails: action.payload };
        }
        case ActionTypes.SetFieldMapping: {
            return { ...state, fieldMapping: action.payload };
        }

        case ActionTypes.ConnectionDetailsVerified: {
            return { ...state, connectionDetails: { ...state.connectionDetails, verified: true } };
        }

        case ActionTypes.UpsertProject: {
            const list = state.projects || [];
            if (action.payload) {
                const found: any = _.find(list, { key: action.payload.key })
                if (!found) {
                    const project = _.pick(action.payload, ['id', 'key', 'description', 'name']);
                    if (action.payload.issueTypes) {
                        project.standardIssueTypes = getIssueTypes(action.payload.issueTypes, false);
                        project.subTaskIssueTypes = getIssueTypes(action.payload.issueTypes, true);
                    }
                    list.push(project);
                }
            }
            return { ...state, projects: list };
        }
        default: return state;
    }

    // --------------------------------------------------------------------------

    function getIssueTypes(list, isSubTask): any {
        return _.map(_.filter(list, { subtask: isSubTask }), (it) => _.pick(it, ['name']));
    }
}
