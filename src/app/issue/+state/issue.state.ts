export interface Issue {
  currentIssueKey: string;
  primaryIssue: any;

  selectedIssue: any;

  purpose: any;
  recentlyViewedItems: any;
  recentmostItem: any;

  updatedField: any;
}

export interface IssueState {
  readonly issue: Issue;
  readonly app: any;
}
