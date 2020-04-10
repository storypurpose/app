import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    ShowConnectionEditor: type("[ShowConnectionDetails]"),
    ShowCustomFieldEditor: type("[ShowCustomFieldEditor]"),
    ShowProjectConfigEditor: type('[ShowProjectConfigEditor]'),

    SetCurrentIssueKey: type("[SetCurrentIssueKey]"),
    SetHierarchicalIssue: type("[SetHierarchicalIssue]"),
    EpicChildrenLoaded: type('[EpicChildrenLoaded]'),

    SetIssuelist: type("[SetIssuelist]"),

    SetMode: type("[SetMode]"),
    SetConnectionDetails: type("[SetConnectionDetails]"),
    ConnectionDetailsVerified: type('[ConnectionDetailsVerified]'),

    LoadProjects: type("[LoadProjects]"),
    UpsertProject: type("[UpsertProject]")
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
export class ShowProjectConfigEditorAction implements Action {
    type = ActionTypes.ShowProjectConfigEditor;
    constructor(public payload: any) { }
}

export class SetCurrentIssueKeyAction implements Action {
    type = ActionTypes.SetCurrentIssueKey;
    constructor(public payload: any) { }
}
export class SetHierarchicalIssueAction implements Action {
    type = ActionTypes.SetHierarchicalIssue;
    constructor(public payload: any) { }
}
export class EpicChildrenLoadedAction implements Action {
    type = ActionTypes.EpicChildrenLoaded;
    constructor(public payload: any) { }
}

export class SetIssuelistAction implements Action {
    type = ActionTypes.SetIssuelist;
    constructor(public payload: any) { }
}

export class SetModeAction implements Action {
    type = ActionTypes.SetMode;
    constructor(public payload: any) { }
}
export class ConnectionDetailsVerifiedAction implements Action {
    type = ActionTypes.ConnectionDetailsVerified;
    constructor(public payload: any) { }
}
export class SetConnectionDetailsAction implements Action {
    type = ActionTypes.SetConnectionDetails;
    constructor(public payload: any) { }
}
export class LoadProjectsAction implements Action {
    type = ActionTypes.LoadProjects;
    constructor(public payload: any) { }
}

export class UpsertProjectAction implements Action {
    type = ActionTypes.UpsertProject;
    constructor(public payload: any) { }
}

export type Actions =
    ShowConnectionEditorAction
    | ShowCustomFieldEditorAction
    | ShowProjectConfigEditorAction

    | SetCurrentIssueKeyAction
    | SetHierarchicalIssueAction
    | EpicChildrenLoadedAction

    | SetIssuelistAction
    
    | SetModeAction

    | SetConnectionDetailsAction
    | ConnectionDetailsVerifiedAction

    | UpsertProjectAction
    | LoadProjectsAction
    ;
