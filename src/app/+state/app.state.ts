export interface App {
  currentSessionVerified: boolean;
  returnUrl: string;

  queryEditorVisible: boolean;

  mode: string;
  connectionEditorVisible: boolean;
  projectConfigEditorVisible: boolean;
  projectToConfigure: any;

  currentIssueKey: string;

  connectionDetails: any;

  organization: any;
  extendedHierarchy: any;

  projects: any;
  currentProject: any;
  currentProjectUpdated: any;
  allExtendedFields: any;
}

export interface AppState {
  readonly app: App;
  readonly issue: any;
}
