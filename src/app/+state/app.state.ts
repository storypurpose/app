import { Purpose } from '../purpose/+state/purpose.state';

export interface App {
  mode: string;
  connectionEditorVisible: boolean;
  customFieldEditorVisible: any;
  currentIssueKey: string;

  connectionDetails: any;
  fieldMapping: any;
}

export interface AppState {
  readonly app: App;
  readonly purpose: Purpose
}
