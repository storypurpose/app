import { Search } from './search.state';
import { SearchresultViewMode } from './search.actions';

export const searchInitialState: Search = {
    queryContext: null,
    issuelist: null,
    viewmode: SearchresultViewMode.LIST
};
