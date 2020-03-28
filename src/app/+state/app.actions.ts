import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    ShowConnectionEditor: type("[ShowConnectionDetails]"),
    ShowCustomFieldEditor: type("[ShowCustomFieldEditor]"),
    SetCurrentIssueKey: type("[SetCurrentIssueKey]"),
    SetMode: type("[SetMode]"),
    SetConnectionDetails: type("[SetConnectionDetails]"),
    SetFieldMapping: type("[SetFieldMapping]")
}

export const ModeTypes = {
    Offline: "offline",
    Online: "online"
}
export class ShowConnectionEditorAction implements Action {
    type = ActionTypes.ShowConnectionEditor;
    constructor(public payload: any) { }
}
export class ShowCustomFieldEditorAction implements Action {
    type = ActionTypes.ShowCustomFieldEditor;
    constructor(public payload: any) { }
}
export class SetCurrentIssueKeyAction implements Action {
    type = ActionTypes.SetCurrentIssueKey;
    constructor(public payload: any) { }
}
export class SetModeAction implements Action {
    type = ActionTypes.SetMode;
    constructor(public payload: any) { }
}
export class SetConnectionDetailsAction implements Action {
    type = ActionTypes.SetConnectionDetails;
    constructor(public payload: any) { }
}
export class SetFieldMappingAction implements Action {
    type = ActionTypes.SetFieldMapping;
    constructor(public payload: any) { }
}
export type Actions =
    ShowConnectionEditorAction
    | ShowCustomFieldEditorAction
    | SetCurrentIssueKeyAction
    | SetModeAction

    | SetConnectionDetailsAction
    | SetFieldMappingAction
    ;
