import * as _ from 'lodash';
import { Issue } from './issue.state';
import { ActionTypes } from './issue.actions';
import { CustomNodeTypes } from 'src/app/lib/jira-tree-utils';

export function issueReducer(state: Issue, action: any): Issue {
    switch (action.type) {
        case ActionTypes.SetSelectedItem: {
            return { ...state, selectedItem: action.payload };
        }

        case ActionTypes.SetPurpose: {
            return { ...state, list: action.payload };
        }
        case ActionTypes.UpdateOrganizationPurpose: {
            const payload = action.payload || {};
            return {
                ...state, list:
                    state.list.map((record) => record.issueType === CustomNodeTypes.Organization
                        ? { ...record, key: payload.name, title: payload.name, purpose: payload.purpose }
                        : record)

            };
        }

        case ActionTypes.SetRecentlyViewed: {
            return { ...state, recentmostItem: action.payload };
        }

        case ActionTypes.UpdateFieldValueSuccess: {
            console.log(action);
            return state;
        }
        
        default: return state;
    }
}
