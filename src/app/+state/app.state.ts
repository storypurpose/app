import { Purpose } from '../purpose/+state/purpose.state';

export interface App {
  mode: string;
  connectionEditorVisible: boolean;
  customFieldEditorVisible: any;
  projectConfigEditorVisible: any;
  currentIssueKey: string;

  connectionDetails: any;
  fieldMapping: any;
  projects: any;
  currentProject: any;
}

export interface AppState {
  readonly app: App;
  readonly purpose: Purpose
}
