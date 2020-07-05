import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    LoadComments: type("[LoadComments]"),
    LoadCommentsFailed: type("[LoadComments] Failed"),
    LoadCommentsSuccess: type("[LoadComments] Success"),

    AddComment: type("[AddComment]"),
    AddCommentFailed: type("[AddComment] Failed"),
    AddCommentSuccess: type("[AddComment] Success"),

    LoadSubtasks: type("[LoadSubtasks]"),
    LoadSubtasksFailed: type("[LoadSubtasks] Failed"),
    LoadSubtasksSuccess: type("[LoadSubtasks] Success"),

    LoadCreateIssueMetadata: type("[LoadCreateIssueMetadata]"),
    LoadCreateIssueMetadataFailed: type("[LoadCreateIssueMetadata] Failed"),
    LoadCreateIssueMetadataSuccess: type("[LoadCreateIssueMetadata] Success"),

    LoadIssueLinkTypes: type("[LoadIssueLinkTypes]"),
    LoadIssueLinkTypesFailed: type("[LoadIssueLinkTypes] Failed"),
    LoadIssueLinkTypesSuccess: type("[LoadIssueLinkTypes] Success"),

    AddIssueLink: type("[AddIssueLink]"),
    AddIssueLinkFailed: type("[AddIssueLink] Failed"),
    AddIssueLinkSuccess: type("[AddIssueLink] Success"),

    LoadIssueLookup: type("[LoadIssueLookup]"),
    LoadIssueLookupFailed: type("[LoadIssueLookup] Failed"),
    LoadIssueLookupSuccess: type("[LoadIssueLookup] Success"),
}

export class LoadCommentsAction implements Action {
    type = ActionTypes.LoadComments;
    constructor(public payload: any) { }
}
export class AddCommentAction implements Action {
    type = ActionTypes.AddComment;
    constructor(public payload: any) { }
}

export class LoadSubtasksAction implements Action {
    type = ActionTypes.LoadSubtasks;
    constructor(public payload: any) { }
}

export class LoadIssueLinkTypesAction implements Action {
    type = ActionTypes.LoadIssueLinkTypes;
    constructor(public payload: any) { }
}
export class AddIssueLinkAction implements Action {
    type = ActionTypes.AddIssueLink;
    constructor(public payload: any) { }
}

export class LoadCreateIssueMetadataAction implements Action {
    type = ActionTypes.LoadCreateIssueMetadata;
    constructor(public payload: any) { }
}

export class LoadIssueLookupAction implements Action {
    type = ActionTypes.LoadIssueLookup;
    constructor(public payload: any) { }
}

export type Actions =
    LoadCommentsAction
    | AddCommentAction
    | LoadSubtasksAction

    | LoadIssueLinkTypesAction
    | AddIssueLinkAction

    | LoadCreateIssueMetadataAction

    | LoadIssueLookupAction
    ;
