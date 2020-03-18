import { Purpose } from '../purpose/+state/purpose.state';

export interface App {
  connectionEditorVisible: boolean;
  customFieldEditorVisible: boolean;
  currentIssueKey: string;
}

export interface AppState {
  readonly app: App;
  readonly purpose: Purpose
}
