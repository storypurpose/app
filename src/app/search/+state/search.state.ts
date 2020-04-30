export interface Search {
  queryExecutorVisible: boolean;
  queryContext: any;
  issuelist: any;
  query: string;
}

export interface SearchState {
  readonly search: Search;
}
