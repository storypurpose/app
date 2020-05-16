import { Issue } from './issue.state';

export const issueInitialState: Issue = {
    primaryIssueKey: '',
    primaryIssue: null,

    selectedIssueKey: '',
    selectedIssue: null,

    hierarchicalIssue: null,

    subtasks: null,

    purpose: [],
    recentlyViewedItems: [],
    recentmostItem: null,

    updatedField: null
};
