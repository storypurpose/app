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

        default: return state;
    }
}
