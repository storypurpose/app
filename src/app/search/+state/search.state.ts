export interface Search {
  queryContext: any;
  issuelist: any;
  viewmode: string;
  roadmapView: any;
  savedSearchlist: any;
}

export interface SearchState {
  readonly search: Search;
}
