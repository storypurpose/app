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
        case ActionTypes.SetIssuelist: {
            return { ...state, issuelist: action.payload };
        }


        default: return state;
    }
}
