import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    LoadComments: type("[LoadComments]"),
    LoadCommentsFailed: type("[LoadComments] Failed"),
    LoadCommentsSuccess: type("[LoadComments] Success"),
}

export class LoadCommentsAction implements Action {
    type = ActionTypes.LoadComments;
    constructor(public payload: any) { }
}

export type Actions =
    LoadCommentsAction
    ;
