import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    SetSelectedItem: type("[SetSelectedItem]"),

    SetPurpose: type("[SetPurpose]"),
    UpdateOrganizationPurpose: type("[UpdateOrganizationPurpose]"),
    SetRecentlyViewed: type("[SetRecentlyViewed]"),

    UpdateFieldValue: type("[UpdateFieldValue]"),
    UpdateFieldValueFailed: type("[UpdateFieldValue] Failed"),
    UpdateFieldValueSuccess: type("[UpdateFieldValue] Success"),
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

    SetSelectedItemAction

    | SetPurposeAction
    | UpdateOrganizationPurposeAction

    | SetRecentlyViewedAction

    | UpdateFieldValueAction
    ;
