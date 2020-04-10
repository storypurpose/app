import { App } from './app.state';

export const appInitialState: App = {
    mode: 'offline',
    connectionEditorVisible: false,
    customFieldEditorVisible: null,
    projectConfigEditorVisible: null,

    issuelist: null,

    currentIssueKey: null,
    hierarchicalIssue: null,
    epicChildrenLoaded: false,

    connectionDetails: null,
    projects: null,
    currentProject: null
};
