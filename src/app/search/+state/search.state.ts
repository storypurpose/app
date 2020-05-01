export interface Search {
  queryContext: any;
  issuelist: any;
  // query: string;
}

export interface SearchState {
  readonly search: Search;
}
