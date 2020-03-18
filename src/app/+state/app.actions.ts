import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    ShowConnectionEditor: type("[ShowConnectionDetails]"),
    ShowCustomFieldEditor: type("[ShowCustomFieldEditor]"),
    SetCurrentIssueKey: type("[SetCurrentIssueKey]")
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
export type Actions =
    ShowConnectionEditorAction
    | ShowCustomFieldEditorAction
    | SetCurrentIssueKeyAction
    ;
