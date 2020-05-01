export interface Search {
  queryContext: any;
  issuelist: any;
  viewmode: string;
  
  savedSearchlist: any;
}

export interface SearchState {
  readonly search: Search;
}
