import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    BootstrapApp: type("[BootstrapApp]"),
    BootstrapAppSuccess: type("[BootstrapApp] Success"),

    SetReturnUrl: type("[SetReturnUrl]"),
    VerifyCurrentSession: type("[VerifyCurrentSession]"),
    VerifyCurrentSessionComplete: type("[VerifyCurrentSession] Success"),

    ToggleQueryEditorVisibility: type("[ToggleQueryEditorVisibility]"),

    ShowConnectionEditor: type("[ShowConnectionDetails]"),

    SetMode: type("[SetMode]"),
    SetModeSuccess: type("[SetMode] Success"),

    SetConnectionDetails: type("[SetConnectionDetails]"),
    SetConnectionDetailsSuccess: type("[SetConnectionDetails] Success"),

    VerifyConnectionDetails: type('[VerifyConnectionDetails] '),
    VerifyConnectionDetailsFailed: type('[VerifyConnectionDetails] Failed'),
    VerifyConnectionDetailsComplete: type('[VerifyConnectionDetails] Success'),

    SetOrganization: type("[SetOrganization]"),
    SetOrganizationSuccess: type("[SetOrganization] Success"),

    SetExtendedHierarchyDetails: type("[SetExtendedHierarchyDetails]"),
    SetExtendedHierarchyDetailsSuccess: type("[SetExtendedHierarchyDetails] Success"),

    SetProjects: type("[SetProjects]"),
    SetProjectsSuccess: type("[SetProjects] Success"),

    ConfigureProject: type('[ConfigureProject]'),
    SetCurrentProject: type("[SetCurrentProject]"),

    UpsertProjectBegin: type("[UpsertProject] Begin"),

    UpsertProject: type("[UpsertProject]"),
    UpsertProjectSuccess: type("[UpsertProject] Success"),

    DismissProjectSetup: type("[DismissProjectSetup]")
}

export const ModeTypes = {
    Offline: "offline",
    Online: "online"
}

export class BootstrapAppAction implements Action {
    type = ActionTypes.BootstrapApp;
    constructor(public payload: any) { }
}

export class SetReturnUrlAction implements Action {
    type = ActionTypes.SetReturnUrl;
    constructor(public payload: any) { }
}
export class VerifyCurrentSessionAction implements Action {
    type = ActionTypes.VerifyCurrentSession;
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

export class SetModeAction implements Action {
    type = ActionTypes.SetMode;
    constructor(public payload: any) { }
}
export class VerifyConnectionDetailsAction implements Action {
    type = ActionTypes.VerifyConnectionDetails;
    constructor(public payload: any) { console.log(payload) }
}
export class ConnectionDetailsVerifiedAction implements Action {
    type = ActionTypes.VerifyConnectionDetailsComplete;
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

export class SetProjectsAction implements Action {
    type = ActionTypes.SetProjects;
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
    BootstrapAppAction
    | SetReturnUrlAction
    | ToggleQueryEditorVisibilityAction

    | ShowConnectionEditorAction
    | ConfigureProjectAction

    | SetModeAction

    | SetConnectionDetailsAction
    | VerifyConnectionDetailsAction
    | ConnectionDetailsVerifiedAction

    | SetOrganizationAction
    | SetExtendedHierarchyDetailsAction

    | SetCurrentProjectAction
    | UpsertProjectAction
    | UpsertProjectBeginAction
    | SetProjectsAction
    | DismissProjectSetupAction
    ;
