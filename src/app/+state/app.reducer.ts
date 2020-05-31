import * as _ from 'lodash';
import { App } from './app.state';
import { ActionTypes } from './app.actions';

export function appReducer(state: App, action: any): App {
    switch (action.type) {
        case ActionTypes.BootstrapAppSuccess: {
            const payload = action.payload;
            return {
                ...state, connectionDetails: payload.connectionDetails || {},
                projects: payload.projects,
                organization: payload.organization || {},
                extendedHierarchy: payload.extendedHierarchy,
                mode: payload.mode
            };
        }

        case ActionTypes.SetReturnUrl: {
            return { ...state, returnUrl: action.payload };
        }
        case ActionTypes.VerifyCurrentSession: {
            return { ...state, currentSessionVerified: null };
        }
        case ActionTypes.VerifyCurrentSessionComplete: {
            return {
                ...state, currentSessionVerified: action.payload.verified,
                connectionDetails: !state.connectionDetails ? null : {
                    ...state.connectionDetails, verified: action.payload.verified
                }
            };
        }

        case ActionTypes.ToggleQueryEditorVisibility: {
            return { ...state, queryEditorVisible: action.payload };
        }
        case ActionTypes.SetModeSuccess: {
            return { ...state, mode: action.payload };
        }

        case ActionTypes.ShowConnectionEditor: {
            return { ...state, connectionEditorVisible: action.payload };
        }
        case ActionTypes.ConfigureProject: {
            return { ...state, projectConfigEditorVisible: action.payload ? true : false, projectToConfigure: action.payload };
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

        case ActionTypes.VerifyConnectionDetailsComplete: {
            return {
                ...state, connectionDetails: {
                    ...state.connectionDetails,
                    serverUrl: action.payload.serverUrl,
                    username: action.payload.username,
                    password: action.payload.password,
                    verified: action.payload.verified
                }
            };
        }

        case ActionTypes.SetProjects: {
            return { ...state, projects: action.payload };
        }

        case ActionTypes.UpsertProjectBegin: {
            return { ...state, currentProjectUpdated: false };
        }

        case ActionTypes.UpsertProject: {
            action.payload.startdate = action.payload.startdate || { id: 'created', name: 'created' };

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
}
