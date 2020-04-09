import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    SetStoryboardItem: type("[SetStoryboardItem]"),
}

export class SetStoryboardItemAction implements Action {
    type = ActionTypes.SetStoryboardItem;
    constructor(public payload: any) { }
}

export type Actions =
    SetStoryboardItemAction
    ;
