import { Issue } from './issue.state';

export const issueInitialState: Issue = {
    currentIssueKey: '',
    issueDetails: null,
    
    selectedItem: null,
    
    purpose: [],
    recentlyViewedItems: [],
    recentmostItem: null,
    
    updatedField: null
};
