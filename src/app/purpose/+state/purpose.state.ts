export interface Purpose {
  selectedItem: any;

  list: any;
  recentlyViewedItems: any;
  recentmostItem: any;
  // organizationEditorVisible: boolean;
  // hierarchyEditorVisible: boolean;
}

export interface PurposeState {
  readonly purpose: Purpose;
}
