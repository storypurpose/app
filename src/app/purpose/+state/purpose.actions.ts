import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    SetSelectedItem: type("[SetSelectedItem]"),

    SetPurpose: type("[SetPurpose]"),
    SetRecentlyViewed: type("[SetRecentlyViewed]"),
    ManageOrganizationEditorVisibility: type("[ManageOrganizationEditorVisibility]"),
    ManageHierarchyEditorVisibility: type("[ManageHierarchyEditorVisibility]")
}

export class SetSelectedItemAction implements Action {
    type = ActionTypes.SetSelectedItem;
    constructor(public payload: any) { }
}

export class SetPurposeAction implements Action {
    type = ActionTypes.SetPurpose;
    constructor(public payload: any) { }
}
export class SetRecentlyViewedAction implements Action {
    type = ActionTypes.SetRecentlyViewed;
    constructor(public payload: any) { }
}
export class ManageOrganizationEditorVisibilityAction implements Action {
    type = ActionTypes.ManageOrganizationEditorVisibility;
    constructor(public payload: any) { }
}
export class ManageHierarchyEditorVisibilityAction implements Action {
    type = ActionTypes.ManageHierarchyEditorVisibility;
    constructor(public payload: any) { }
}
export type Actions =

    SetSelectedItemAction

    | SetPurposeAction
    | SetRecentlyViewedAction
    | ManageOrganizationEditorVisibilityAction
    | ManageHierarchyEditorVisibilityAction
    ;
