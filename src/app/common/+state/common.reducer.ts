import * as _ from 'lodash';
import { Common } from './common.state';
import * as jiraTreeUtil from 'src/app/lib/jira-tree-utils';
import { ActionTypes } from './common.actions';

export function commonReducer(state: Common, action: any): Common {
    switch (action.type) {
        case ActionTypes.LoadCommentsSuccess: {
            let records = action.payload;
            let total = 0;
            if (action.payload && action.payload.comments) {
                total = action.payload.total;
                records = jiraTreeUtil.flattenComments(action.payload.comments);
            }
            return { ...state, comments: { total, records } };
        }

        default: return state;
    }
}

