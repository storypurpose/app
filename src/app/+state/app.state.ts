import { Purpose } from '../purpose/+state/purpose.state';
import { Search } from '../search/+state/search.state';

export interface App {
  query: string;
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
  readonly purpose: Purpose;
  readonly search: Search;
}
