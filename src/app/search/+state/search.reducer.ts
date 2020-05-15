import * as _ from 'lodash';
import { Search } from './search.state';
import { ActionTypes } from './search.actions';

export function searchReducer(state: Search, action: any): Search {
    switch (action.type) {
        case ActionTypes.SwitchViewmode: {
            return { ...state, viewmode: action.payload };
        }
        case ActionTypes.SetQueryContext: {
            return { ...state, queryContext: action.payload };
        }
        case ActionTypes.LoadSearchResults: {
            return { ...state, issuelist: [] };
        }
        case ActionTypes.LoadSearchResultsSuccess: {
            return { ...state, issuelist: action.payload };
        }

        case ActionTypes.LoadSavedSearchlist: {
            return { ...state, savedSearchlist: [] };
        }

        case ActionTypes.LoadSavedSearchlistSuccess: {
            const savedSearchlist = _.map(action.payload, item => _.pick(item, ['id', 'name', 'jql']));
            return { ...state, savedSearchlist };
        }

        default: return state;
    }
}
