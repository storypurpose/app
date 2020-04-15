import { Purpose } from '../purpose/+state/purpose.state';

export interface App {
  mode: string;
  connectionEditorVisible: boolean;
  projectConfigEditorVisible: any;

  issuelist: any;

  currentIssueKey: string;
  hierarchicalIssue: any;
  epicChildrenLoaded: boolean;

  connectionDetails: any;

  organization: any;
  extendedHierarchy: any;
  projects: any;
  currentProject: any;
}

export interface AppState {
  readonly app: App;
  readonly purpose: Purpose
}
