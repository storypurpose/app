import * as _ from 'lodash';
import { Storyboarding } from './storyboarding.state';
import { ActionTypes } from './storyboarding.actions';

export function storyboardingReducer(state: Storyboarding, action: any): Storyboarding {
    switch (action.type) {
        case ActionTypes.SetStoryboardItem: {
            return { ...state, storyboardItem: action.payload };
        }

        default: return state;
    }
}
