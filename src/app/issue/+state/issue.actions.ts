import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    LoadPrimaryIssue: type("[LoadPrimaryIssue]"),
    LoadPrimaryIssueFailed: type("[LoadPrimaryIssue] Failed"),
    LoadPrimaryIssueSuccess: type("[LoadPrimaryIssue] Success"),

    LoadEpicChildren: type("[LoadEpicChildren]"),
    LoadEpicChildrenFailed: type("[LoadEpicChildren] Failed"),
    LoadEpicChildrenSuccess: type("[LoadEpicChildren] Success"),

    LoadRelatedLinks: type("[LoadRelatedLinks]"),
    LoadRelatedLinksFailed: type("[LoadRelatedLinks] Failed"),
    LoadRelatedLinksSuccess: type("[LoadRelatedLinks] Success"),

    LoadProjectDetails: type("[LoadProjectDetails]"),
    LoadProjectDetailsFailed: type("[LoadProjectDetails] Failed"),
    LoadProjectDetailsSuccess: type("[LoadProjectDetails] Success"),

    LoadSelectedIssue: type("[LoadSelectedIssue]"),
    LoadSelectedIssueFailed: type("[LoadSelectedIssue] Failed"),
    LoadSelectedIssueSuccess: type("[LoadSelectedIssue] Success"),

    SetSelectedItem: type("[SetSelectedItem]"),

    SetPurpose: type("[SetPurpose]"),
    UpdateOrganizationPurpose: type("[UpdateOrganizationPurpose]"),
    SetRecentlyViewed: type("[SetRecentlyViewed]"),

    UpdateFieldValue: type("[UpdateFieldValue]"),
    UpdateFieldValueFailed: type("[UpdateFieldValue] Failed"),
    UpdateFieldValueSuccess: type("[UpdateFieldValue] Success"),
}

export class LoadIssueDetailsAction implements Action {
    type = ActionTypes.LoadPrimaryIssue;
    constructor(public payload: any) { }
}
export class LoadEpicChildrenAction implements Action {
    type = ActionTypes.LoadEpicChildren;
    constructor(public payload: any) { }
}
export class LoadRelatedLinksAction implements Action {
    type = ActionTypes.LoadRelatedLinks;
    constructor(public payload: any) { }
}
export class LoadProjectDetailsAction implements Action {
    type = ActionTypes.LoadProjectDetails;
    constructor(public payload: any) { }
}

export class LoadSelectedIssueAction implements Action {
    type = ActionTypes.LoadSelectedIssue;
    constructor(public payload: any) { }
}
export class SetSelectedItemAction implements Action {
    type = ActionTypes.SetSelectedItem;
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

export type Actions =
    LoadIssueDetailsAction
    | LoadEpicChildrenAction
    | LoadRelatedLinksAction

    | LoadSelectedIssueAction
    | SetSelectedItemAction

    | SetPurposeAction
    | UpdateOrganizationPurposeAction

    | SetRecentlyViewedAction

    | UpdateFieldValueAction
    ;
