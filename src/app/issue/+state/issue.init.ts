import { Issue } from './issue.state';

export const issueInitialState: Issue = {
    primaryIssueKey: '',
    primaryIssue: null,

    selectedIssueKey: '',
    selectedIssue: null,
    timelineView: null,

    isSelectedIssueViewCompact: false,
    hierarchicalIssue: null,

    // subtasks: null,
    // comments: null,

    purpose: [],
    recentlyViewedItems: [],
    recentmostItem: null,

    updatedField: null,
    issueLinkTypes: []
};
