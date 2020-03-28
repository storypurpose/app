import { App } from './app.state';

export const appInitialState: App = {
    mode: 'offline',
    connectionEditorVisible: false,
    customFieldEditorVisible: null,
    currentIssueKey: null,

    connectionDetails: null,
    fieldMapping: null
};
