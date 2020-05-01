import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const SearchresultViewMode = {
    LIST: 'LIST',
    STORYBOARD: 'STORYBOARD'
}
export const ActionTypes = {
    SwitchViewmode: type('[SwitchViewmode]'),
    SetQueryContext: type('[SetQueryContext]'),
    SetIssuelist: type("[SetIssuelist]")
}

export class SwitchSearchresultViewmodeAction implements Action {
    type = ActionTypes.SwitchViewmode;
    constructor(public payload: any) { }
}
export class SetQueryContextAction implements Action {
    type = ActionTypes.SetQueryContext;
    constructor(public payload: any) { }
}
export class SetIssuelistAction implements Action {
    type = ActionTypes.SetIssuelist;
    constructor(public payload: any) { }
}

export type Actions =
    SwitchSearchresultViewmodeAction
    | SetQueryContextAction
    | SetIssuelistAction
    ;
