import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    SetSearchQuery: type("[SetSearchQuery]"),
    ToggleQueryEditorVisibility: type("[ToggleQueryEditorVisibility]"),

    ShowConnectionEditor: type("[ShowConnectionDetails]"),

    SetCurrentIssueKey: type("[SetCurrentIssueKey]"),
    SetHierarchicalIssue: type("[SetHierarchicalIssue]"),
    EpicChildrenLoaded: type('[EpicChildrenLoaded]'),

    SetMode: type("[SetMode]"),
    SetConnectionDetails: type("[SetConnectionDetails]"),
    ConnectionDetailsVerified: type('[ConnectionDetailsVerified]'),

    SetOrganization: type("[SetOrganization]"),
    SetExtendedHierarchyDetails: type("SetExtendedHierarchyDetails"),

    ConfigureProject: type('[ConfigureProject]'),
    LoadProjects: type("[LoadProjects]"),
    SetCurrentProject: type("[SetCurrentProject]"),
    UpsertProjectBegin: type("[UpsertProject] Begin"),
    UpsertProject: type("[UpsertProject]"),
    DismissProjectSetup: type("[DismissProjectSetup]")
}

export const ModeTypes = {
    Offline: "offline",
    Online: "online"
}

export class SetSearchQueryAction implements Action {
    type = ActionTypes.SetSearchQuery;
    constructor(public payload: any) { }
}
export class ToggleQueryEditorVisibilityAction implements Action {
    type = ActionTypes.ToggleQueryEditorVisibility;
    constructor(public payload: any) { }
}

export class ShowConnectionEditorAction implements Action {
    type = ActionTypes.ShowConnectionEditor;
    constructor(public payload: any) { }
}
export class ConfigureProjectAction implements Action {
    type = ActionTypes.ConfigureProject;
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
export class SetCurrentProjectAction implements Action {
    type = ActionTypes.SetCurrentProject;
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
export class DismissProjectSetupAction implements Action {
    type = ActionTypes.DismissProjectSetup;
    constructor(public payload: any) { }
}

export type Actions =
    SetSearchQueryAction
    | ToggleQueryEditorVisibilityAction

    | ShowConnectionEditorAction
    | ConfigureProjectAction

    | SetCurrentIssueKeyAction
    | SetHierarchicalIssueAction
    | EpicChildrenLoadedAction

    | SetModeAction

    | SetConnectionDetailsAction
    | ConnectionDetailsVerifiedAction

    | SetOrganizationAction
    | SetExtendedHierarchyDetailsAction

    | SetCurrentProjectAction
    | UpsertProjectAction
    | UpsertProjectBeginAction
    | LoadProjectsAction
    | DismissProjectSetupAction
    ;
