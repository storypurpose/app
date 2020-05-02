import { App } from './app.state';

export const appInitialState: App = {
    query: '',
    queryEditorVisible: false,
    
    mode: 'offline',
    connectionEditorVisible: false,
    projectConfigEditorVisible: false,
    projectToConfigure: null,
    
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
