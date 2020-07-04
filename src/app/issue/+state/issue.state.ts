export interface Issue {
  primaryIssueKey: string;
  primaryIssue: any;

  selectedIssueKey: string;
  selectedIssue: any;
  timelineView: any;
  
  isSelectedIssueViewCompact: boolean;
  
  hierarchicalIssue: any;

  // subtasks: any;
  // comments: any;

  purpose: any;
  recentlyViewedItems: any;
  recentmostItem: any;

  updatedField: any;

  issueLinkTypes: any;
}

export interface IssueState {
  readonly issue: Issue;
  readonly app: any;
}
