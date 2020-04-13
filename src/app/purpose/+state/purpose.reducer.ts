import * as _ from 'lodash';
import { Purpose } from './purpose.state';
import { ActionTypes } from './purpose.actions';

export function purposeReducer(state: Purpose, action: any): Purpose {
    switch (action.type) {
        case ActionTypes.SetSelectedItem: {
            return { ...state, selectedItem: action.payload };
        }

        case ActionTypes.SetPurpose: {
            return { ...state, item: action.payload };
        }
        case ActionTypes.SetRecentlyViewed: {
            return { ...state, recentmostItem: action.payload };
        }
        // case ActionTypes.ManageOrganizationEditorVisibility: {
        //     return { ...state, organizationEditorVisible: action.payload };
        // }
        // case ActionTypes.ManageHierarchyEditorVisibility: {
        //     return { ...state, hierarchyEditorVisible: action.payload };
        // }
        default: return state;
    }
}
