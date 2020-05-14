import * as _ from 'lodash';
import { App } from './app.state';
import { ActionTypes } from './app.actions';

export function appReducer(state: App, action: any): App {
    switch (action.type) {
        case ActionTypes.ToggleQueryEditorVisibility: {
            return { ...state, queryEditorVisible: action.payload };
        }
        case ActionTypes.SetMode: {
            return { ...state, mode: action.payload };
        }

        case ActionTypes.ShowConnectionEditor: {
            return { ...state, connectionEditorVisible: action.payload };
        }
        case ActionTypes.ConfigureProject: {
            return { ...state, projectConfigEditorVisible: action.payload ? true : false, projectToConfigure: action.payload };
        }

        case ActionTypes.SetCurrentIssueKeyObsolete: {
            return { ...state, currentIssueKey: action.payload };
        }
        case ActionTypes.SetHierarchicalIssue: {
            return { ...state, hierarchicalIssue: action.payload };
        }
        case ActionTypes.EpicChildrenLoaded: {
            return { ...state, epicChildrenLoaded: action.payload };
        }

        case ActionTypes.SetConnectionDetails: {
            return { ...state, connectionDetails: action.payload };
        }

        case ActionTypes.SetOrganization: {
            const payload = action.payload || {};
            return {
                ...state, organization: {
                    ...state.organization, name: payload.name, purpose: payload.purpose
                }
            };
        }
        case ActionTypes.SetExtendedHierarchyDetails: {
            return { ...state, extendedHierarchy: action.payload };
        }

        case ActionTypes.ConnectionDetailsVerified: {
            return {
                ...state, connectionDetails: {
                    ...state.connectionDetails,
                    serverUrl: action.payload.serverUrl,
                    username: action.payload.username,
                    password: action.payload.password,
                    verified: true
                }
            };
        }

        case ActionTypes.LoadProjects: {
            return { ...state, projects: action.payload };
        }

        case ActionTypes.SetCurrentProject: {
            return { ...state, currentProject: action.payload };
        }
        case ActionTypes.UpsertProjectBegin: {
            return { ...state, currentProjectUpdated: false };
        }

        case ActionTypes.UpsertProject: {
            const list = state.projects || [];
            let currentProject = state.currentProject;
            if (action.payload) {
                list.forEach(p => p.current = false);
                currentProject = _.find(list, { key: action.payload.key })
                if (!currentProject) {
                    currentProject = action.payload;
                    list.push(currentProject);
                }
                currentProject.current = true;
            }
            return { ...state, projects: list, currentProject, currentProjectUpdated: true };
        }

        case ActionTypes.DismissProjectSetup: {
            return { ...state, currentProject: { ...state.currentProject, isConfigured: true } };
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
