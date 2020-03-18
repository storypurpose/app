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
    }
}
