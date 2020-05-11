import { Issue } from './issue.state';

export const issueInitialState: Issue = {
    currentIssueKey: '',
    primaryIssue: null,
    
    selectedIssue: null,
    
    purpose: [],
    recentlyViewedItems: [],
    recentmostItem: null,
    
    updatedField: null
};
