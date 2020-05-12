export interface Issue {
  primaryIssueKey: string;
  primaryIssue: any;

  selectedIssueKey: string;
  selectedIssue: any;

  subtasks: any;
  
  purpose: any;
  recentlyViewedItems: any;
  recentmostItem: any;

  updatedField: any;
}

export interface IssueState {
  readonly issue: Issue;
  readonly app: any;
}
