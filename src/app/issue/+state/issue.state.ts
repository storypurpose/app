export interface Issue {
  selectedItem: any;

  list: any;
  recentlyViewedItems: any;
  recentmostItem: any;

  updatedField: any;
}

export interface IssueState {
  readonly issue: Issue;
}
