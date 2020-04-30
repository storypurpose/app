import { App } from './app.state';

export const appInitialState: App = {
    mode: 'offline',
    connectionEditorVisible: false,
    projectConfigEditorVisible: null,
    // queryExecutorVisible: false,
    
    // issuelist: null,

    currentIssueKey: null,
    hierarchicalIssue: null,
    epicChildrenLoaded: false,

    connectionDetails: null,
    organization: null,
    extendedHierarchy: null, 
    
    projects: null,
    currentProject: null,
    currentProjectUpdated: false
};
