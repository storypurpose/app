import { App } from './app.state';

export const appInitialState: App = {
    mode: 'offline',
    connectionEditorVisible: false,
    customFieldEditorVisible: null,
    projectConfigEditorVisible: null,

    currentIssueKey: null,
    hierarchicalIssue: null,

    connectionDetails: null,
    projects: null,
    currentProject: null
};
