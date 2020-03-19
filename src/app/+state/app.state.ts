import { Purpose } from '../purpose/+state/purpose.state';

export interface App {
  connectionEditorVisible: boolean;
  customFieldEditorVisible: any;
  currentIssueKey: string;
}

export interface AppState {
  readonly app: App;
  readonly purpose: Purpose
}
