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

        case ActionTypes.LoadProjects: {
            return { ...state, projects: action.payload };
        }

        case ActionTypes.UpsertProject: {
            const list = state.projects || [];
            let currentProject = state.currentProject;
            if (action.payload) {
                list.forEach(p => p.current = false);
                currentProject = _.find(list, { key: action.payload.key })
                if (!currentProject) {
                    currentProject = _.pick(action.payload, ['id', 'key', 'description', 'name', 'customFields']);
                    currentProject.hierarchy = [];
                    if (action.payload.issueTypes) {
                        currentProject.standardIssueTypes = getIssueTypes(action.payload.issueTypes, false);
                        currentProject.subTaskIssueTypes = getIssueTypes(action.payload.issueTypes, true);
                    }
                    list.push(currentProject);
                }
                currentProject.current = true;
            }
            return { ...state, projects: list, currentProject };
        }
        default: return state;
    }

    // --------------------------------------------------------------------------

    function getIssueTypes(list, isSubTask): any {
        return _.map(_.filter(list, { subtask: isSubTask }), (it) => {
            return { name: it.name, list: [] }
        });
    }
}
