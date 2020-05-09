import { Issue } from './issue.state';

export const issueInitialState: Issue = {
    selectedItem: null,
    
    list: [],
    recentlyViewedItems: [],
    recentmostItem: null,
    
    updatedField: null
};
