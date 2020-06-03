export interface Search {
  queryContext: any;
  issuelist: any;
  roadmapView: any;
  savedSearchlist: any;
}

export interface SearchState {
  readonly search: Search;
  readonly app: any;
}
