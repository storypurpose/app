export interface Common {
  comments: any;
  subtasks: any;
  
  issueLookup: any;
  issueLinkTypes: any;
  issueLinkAdded: any;

  createIssueMetadata: any;
}

export interface CommonState {
  readonly common: Common;
}
