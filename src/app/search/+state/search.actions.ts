import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const SearchresultViewMode = {
    LIST: 'LIST',
    STORYBOARD: 'STORYBOARD'
}
export const ActionTypes = {
    SwitchViewmode: type('[SwitchViewmode]'),
    SetQueryContext: type('[SetQueryContext]'),

    LoadSearchResults: type("[LoadSearchResults]"),
    LoadSearchResultsFailed: type("[LoadSearchResults] Failed"),
    LoadSearchResultsSuccess: type("[LoadSearchResults] Success"),

    LoadSavedSearchlist: type("[LoadSavedSearchlist]"),
    LoadSavedSearchlistFailed: type("[LoadSavedSearchlist] Failed"),
    LoadSavedSearchlistSuccess: type("[LoadSavedSearchlist] Success")

}

export class SwitchSearchresultViewmodeAction implements Action {
    type = ActionTypes.SwitchViewmode;
    constructor(public payload: any) { }
}
export class SetQueryContextAction implements Action {
    type = ActionTypes.SetQueryContext;
    constructor(public payload: any) { }
}
export class LoadSearchResultsAction implements Action {
    type = ActionTypes.LoadSearchResults;
    constructor(public payload: any) { }
}

export class LoadSavedSearchlistAction implements Action {
    type = ActionTypes.LoadSavedSearchlist;
    constructor(public payload: any) { }
}

export type Actions =
    SwitchSearchresultViewmodeAction
    | SetQueryContextAction
    | LoadSearchResultsAction
    | LoadSavedSearchlistAction
    ;
