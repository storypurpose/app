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

    SetOrganization: type("[SetOrganization]"),
    SetExtendedHierarchyDetails: type("SetExtendedHierarchyDetails"),

    LoadProjects: type("[LoadProjects]"),
    UpsertProjectBegin: type("[UpsertProject] Begin"),
    UpsertProject: type("[UpsertProject]"),
    DismissProjectSetup: type("[DismissProjectSetup]")
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

export class SetOrganizationAction implements Action {
    type = ActionTypes.SetOrganization;
    constructor(public payload: any) { }
}
export class SetExtendedHierarchyDetailsAction implements Action {
    type = ActionTypes.SetExtendedHierarchyDetails;
    constructor(public payload: any) { }
}

export class LoadProjectsAction implements Action {
    type = ActionTypes.LoadProjects;
    constructor(public payload: any) { }
}
export class UpsertProjectBeginAction implements Action {
    type = ActionTypes.UpsertProjectBegin;
    constructor(public payload: any) { }
}
export class UpsertProjectAction implements Action {
    type = ActionTypes.UpsertProject;
    constructor(public payload: any) { }
}
export class DismissProjectSetupAction implements Action{
    type = ActionTypes.DismissProjectSetup;
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

    | SetOrganizationAction
    | SetExtendedHierarchyDetailsAction

    | UpsertProjectAction
    | UpsertProjectBeginAction
    | LoadProjectsAction
    | DismissProjectSetupAction
    ;
