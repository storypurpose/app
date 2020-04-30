import * as _ from 'lodash';
import { Search } from './search.state';
import { ActionTypes } from './search.actions';

export function searchReducer(state: Search, action: any): Search {
    switch (action.type) {
        case ActionTypes.ShowQueryExecutorVisible: {
            return { ...state, queryContext: null, queryExecutorVisible: action.payload };
        }
        case ActionTypes.SetQueryContext: {
            return { ...state, queryContext: action.payload, queryExecutorVisible: true };
        }
        case ActionTypes.SetIssuelist: {
            return { ...state, query: action.payload.query, issuelist: action.payload.result };
        }


        default: return state;
    }
}
