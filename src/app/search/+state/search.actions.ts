import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    ShowQueryExecutorVisible: type('[ShowQueryExecutorVisible]'),
    SetQueryContext: type('[SetQueryContext]'),
    SetIssuelist: type("[SetIssuelist]")
}

export class ShowQueryExecutorVisibleAction implements Action {
    type = ActionTypes.ShowQueryExecutorVisible;
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
    ShowQueryExecutorVisibleAction
    | SetQueryContextAction
    | SetIssuelistAction
    ;
