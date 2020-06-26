import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    LoadPrimaryIssue: type("[LoadPrimaryIssue]"),
    LoadPrimaryIssueFailed: type("[LoadPrimaryIssue] Failed"),
    LoadPrimaryIssueSuccess: type("[LoadPrimaryIssue] Success"),

    LoadPrimaryIssueEpicChildren: type("[LoadPrimaryIssueEpicChildren]"),
    LoadPrimaryIssueEpicChildrenFailed: type("[LoadPrimaryIssueEpicChildren] Failed"),
    LoadPrimaryIssueEpicChildrenSuccess: type("[LoadPrimaryIssueEpicChildren] Success"),

    LoadPrimaryIssueRelatedLinks: type("[LoadPrimaryIssueRelatedLinks]"),
    LoadPrimaryIssueRelatedLinksFailed: type("[LoadPrimaryIssueRelatedLinks] Failed"),
    LoadPrimaryIssueRelatedLinksSuccess: type("[LoadPrimaryIssueRelatedLinks] Success"),

    SetHierarchicalIssue: type("[SetHierarchicalIssue]"),

    // LoadComments: type("[LoadComments]"),
    // LoadCommentsFailed: type("[LoadComments] Failed"),
    // LoadCommentsSuccess: type("[LoadComments] Success"),

    LoadSubtasks: type("[LoadSubtasks]"),
    LoadSubtasksFailed: type("[LoadSubtasks] Failed"),
    LoadSubtasksSuccess: type("[LoadSubtasks] Success"),

    LoadProjectDetails: type("[LoadProjectDetails]"),
    LoadProjectDetailsFailed: type("[LoadProjectDetails] Failed"),
    LoadProjectDetailsSuccess: type("[LoadProjectDetails] Success"),

    LoadSelectedIssue: type("[LoadSelectedIssue]"),
    LoadSelectedIssueFailed: type("[LoadSelectedIssue] Failed"),
    LoadSelectedIssueSuccess: type("[LoadSelectedIssue] Success"),

    ChangeSelectedIssueView: type("[ChangeSelectedIssueView]"),

    LoadSelectedIssueEpicChildren: type("[LoadSelectedIssueEpicChildren]"),
    LoadSelectedIssueEpicChildrenFailed: type("[LoadSelectedIssueEpicChildren] Failed"),
    LoadSelectedIssueEpicChildrenSuccess: type("[LoadSelectedIssueEpicChildren] Success"),

    LoadSelectedIssueRelatedLinks: type("[LoadSelectedIssueRelatedLinks]"),
    LoadSelectedIssueRelatedLinksFailed: type("[LoadSelectedIssueRelatedLinks] Failed"),
    LoadSelectedIssueRelatedLinksSuccess: type("[LoadSelectedIssueRelatedLinks] Success"),

    SetSelectedIssue: type("[SetSelectedIssue]"),
    PopulateIssueTimelineView: type("[PopulateIssueTimelineView]"),

    SetPurpose: type("[SetPurpose]"),
    UpdateOrganizationPurpose: type("[UpdateOrganizationPurpose]"),
    SetRecentlyViewed: type("[SetRecentlyViewed]"),

    UpdateFieldValue: type("[UpdateFieldValue]"),
    UpdateFieldValueFailed: type("[UpdateFieldValue] Failed"),
    UpdateFieldValueSuccess: type("[UpdateFieldValue] Success"),

    UpdateOrganizationTitle: type("[UpdateOrganizationTitle]"),
    UpdateOrganizationTitleFailed: type("[UpdateOrganizationTitle] Failed"),
    UpdateOrganizationTitleSuccess: type("[UpdateOrganizationTitle] Success"),
}

export class LoadPrimaryIssueAction implements Action {
    type = ActionTypes.LoadPrimaryIssue;
    constructor(public payload: any) { }
}
export class LoadPrimaryIssueEpicChildrenAction implements Action {
    type = ActionTypes.LoadPrimaryIssueEpicChildren;
    constructor(public payload: any) { }
}
export class LoadPrimaryIssueRelatedLinksAction implements Action {
    type = ActionTypes.LoadPrimaryIssueRelatedLinks;
    constructor(public payload: any) { }
}

export class SetHierarchicalIssueAction implements Action {
    type = ActionTypes.SetHierarchicalIssue;
    constructor(public payload: any) { }
}

export class LoadSubtasksAction implements Action {
    type = ActionTypes.LoadSubtasks;
    constructor(public payload: any) { }
}

// export class LoadCommentsAction implements Action {
//     type = ActionTypes.LoadComments;
//     constructor(public payload: any) { }
// }

export class LoadProjectDetailsAction implements Action {
    type = ActionTypes.LoadProjectDetails;
    constructor(public payload: any) { }
}

export class LoadSelectedIssueAction implements Action {
    type = ActionTypes.LoadSelectedIssue;
    constructor(public payload: any) { }
}
export class ChangeSelectedIssueViewAction implements Action {
    type = ActionTypes.ChangeSelectedIssueView;
    constructor(public payload: any) { }
}

export class LoadSelectedIssueEpicChildrenAction implements Action {
    type = ActionTypes.LoadSelectedIssueEpicChildren;
    constructor(public payload: any) { }
}
export class LoadSelectedIssueRelatedLinksAction implements Action {
    type = ActionTypes.LoadSelectedIssueRelatedLinks;
    constructor(public payload: any) { }
}


export class SetSelectedIssueAction implements Action {
    type = ActionTypes.SetSelectedIssue;
    constructor(public payload: any) { }
}
export class PopulateIssueTimelineViewAction implements Action {
    type = ActionTypes.PopulateIssueTimelineView;
    constructor(public payload: any) { }
}

export class SetPurposeAction implements Action {
    type = ActionTypes.SetPurpose;
    constructor(public payload: any) { }
}
export class UpdateOrganizationPurposeAction implements Action {
    type = ActionTypes.UpdateOrganizationPurpose;
    constructor(public payload: any) { }
}

export class SetRecentlyViewedAction implements Action {
    type = ActionTypes.SetRecentlyViewed;
    constructor(public payload: any) { }
}

export class UpdateFieldValueAction implements Action {
    type = ActionTypes.UpdateFieldValue;
    constructor(public payload: any) { }
}

export class UpdateOrganizationTitleAction implements Action {
    type = ActionTypes.UpdateOrganizationTitle;
    constructor(public payload: any) { }
}

export type Actions =
    LoadPrimaryIssueAction
    | LoadPrimaryIssueEpicChildrenAction
    | LoadPrimaryIssueRelatedLinksAction

    | LoadSelectedIssueAction
    | ChangeSelectedIssueViewAction
    | SetSelectedIssueAction
    | PopulateIssueTimelineViewAction

    | LoadSelectedIssueEpicChildrenAction
    | LoadSelectedIssueRelatedLinksAction

    | SetHierarchicalIssueAction

    | SetPurposeAction
    | UpdateOrganizationPurposeAction

    | SetRecentlyViewedAction

    | UpdateFieldValueAction

    | UpdateOrganizationTitleAction
    ;
