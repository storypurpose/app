import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    SetPurpose: type("[SetPurpose]"),
    SetRecentlyViewed: type("[SetRecentlyViewed]")
}
export class SetPurposeAction implements Action {
    type = ActionTypes.SetPurpose;
    constructor(public payload: any) { }
}
export class SetRecentlyViewedAction implements Action {
    type = ActionTypes.SetRecentlyViewed;
    constructor(public payload: any) { }
}

export type Actions =
    SetPurposeAction
    | SetRecentlyViewedAction
    ;
