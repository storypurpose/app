import { Action } from '@ngrx/store';
import { type } from 'src/app/lib/utils';

export const ActionTypes = {
    SetQueryContext: type('[SetQueryContext]'),

    LoadSearchResults: type("[LoadSearchResults]"),
    LoadSearchResultsFailed: type("[LoadSearchResults] Failed"),
    LoadSearchResultsSuccess: type("[LoadSearchResults] Success"),

    LoadSavedSearchlist: type("[LoadSavedSearchlist]"),
    LoadSavedSearchlistFailed: type("[LoadSavedSearchlist] Failed"),
    LoadSavedSearchlistSuccess: type("[LoadSavedSearchlist] Success"),

    PopulateSearchResultTimelineView: type("[PopulateSearchResultTimelineView]"),

    LoadSearchResultTimelineNode: type("[LoadSearchResultTimelineNode]"),
    LoadSearchResultTimelineNodeFailed: type("[LoadSearchResultTimelineNode] Failed"),
    LoadSearchResultTimelineNodeSuccess: type("[LoadSearchResultTimelineNode] Success")

}

export class PopulateSearchResultTimelineViewAction implements Action {
    type = ActionTypes.PopulateSearchResultTimelineView;
    constructor(public payload: any) { }
}
export class LoadSearchResultTimelineNodeAction implements Action {
    type = ActionTypes.LoadSearchResultTimelineNode;
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
    PopulateSearchResultTimelineViewAction
    | LoadSearchResultTimelineNodeAction

    | SetQueryContextAction
    | LoadSearchResultsAction
    | LoadSavedSearchlistAction
    ;
