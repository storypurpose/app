import { Purpose } from '../purpose/+state/purpose.state';

export interface App {
  mode: string;
  connectionEditorVisible: boolean;
  // customFieldEditorVisible: any;
  projectConfigEditorVisible: any;

  issuelist: any;

  currentIssueKey: string;
  hierarchicalIssue: any;
  epicChildrenLoaded: boolean;
  
  connectionDetails: any;

  organizationDetails: any;

  projects: any;
  currentProject: any;
}

export interface AppState {
  readonly app: App;
  readonly purpose: Purpose
}
