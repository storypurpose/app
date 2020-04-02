export interface Purpose {
  item: any;
  recentlyViewedItems: any;
  recentmostItem: any;
  organizationEditorVisible: boolean;
  hierarchyEditorVisible: boolean;
}

export interface PurposeState {
  readonly purpose: Purpose;
}
