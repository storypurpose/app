export interface Issue {
  currentIssueKey: string;
  issueDetails: any;

  selectedItem: any;

  purpose: any;
  recentlyViewedItems: any;
  recentmostItem: any;

  updatedField: any;
}

export interface IssueState {
  readonly issue: Issue;
}
