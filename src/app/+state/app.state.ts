export interface App {
  queryEditorVisible: boolean;

  mode: string;
  connectionEditorVisible: boolean;
  projectConfigEditorVisible: boolean;
  projectToConfigure: any;

  currentIssueKey: string;
  hierarchicalIssue: any;
  epicChildrenLoaded: boolean;

  connectionDetails: any;

  organization: any;
  extendedHierarchy: any;

  projects: any;
  currentProject: any;
  currentProjectUpdated: any;
}

export interface AppState {
  readonly app: App;
  readonly issue: any;
}
