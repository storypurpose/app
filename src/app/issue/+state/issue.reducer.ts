import * as _ from 'lodash';
import { Issue } from './issue.state';
import { ActionTypes } from './issue.actions';
import { CustomNodeTypes, searchTreeByKey } from 'src/app/lib/jira-tree-utils';

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

        case ActionTypes.UpdateFieldValue: {
            return { ...state, updatedField: null }
        }

        case ActionTypes.UpdateFieldValueSuccess: {
            const selectedItem = state.selectedItem;
            const updatedField = action.payload;
            const found = searchTreeByKey(selectedItem, updatedField.issueKey);
            if (found) {
                if (updatedField.fieldName === 'title') {
                    found.title = updatedField.updatedValue;
                } else if (updatedField.fieldName === 'fixVersions')
                    found.fixVersions = _.map(updatedField.updatedValue, v => v.name);
            }
            return { ...state, updatedField, selectedItem };
        }

        default: return state;
    }
}
