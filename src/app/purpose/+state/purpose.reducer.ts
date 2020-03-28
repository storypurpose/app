import * as _ from 'lodash';
import { Purpose } from './purpose.state';
import { ActionTypes } from './purpose.actions';

export function purposeReducer(state: Purpose, action: any): Purpose {
    switch (action.type) {
        case ActionTypes.SetPurpose: {
            return { ...state, item: action.payload };
        }
        case ActionTypes.SetRecentlyViewed: {
            //TODO: Maintain array
            return { ...state, recentmostItem: action.payload };
        }

        default: return state;
    }
}
