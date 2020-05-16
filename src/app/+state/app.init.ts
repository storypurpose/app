import { App } from './app.state';

export const appInitialState: App = {
    currentSessionVerified: null,
    returnUrl: '',

    queryEditorVisible: false,

    mode: 'offline',
    connectionEditorVisible: false,
    projectConfigEditorVisible: false,
    projectToConfigure: null,

    currentIssueKey: null,

    connectionDetails: null,
    organization: null,
    extendedHierarchy: null,

    projects: null,
    currentProject: null,
    currentProjectUpdated: false
};
