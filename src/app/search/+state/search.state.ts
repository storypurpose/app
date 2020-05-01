export interface Search {
  queryContext: any;
  issuelist: any;
  viewmode: string;
  // query: string;
}

export interface SearchState {
  readonly search: Search;
}
