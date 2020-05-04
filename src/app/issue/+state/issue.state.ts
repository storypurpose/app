export interface Issue {
  selectedItem: any;

  list: any;
  recentlyViewedItems: any;
  recentmostItem: any;
  // organizationEditorVisible: boolean;
  // hierarchyEditorVisible: boolean;
}

export interface IssueState {
  readonly issue: Issue;
}
