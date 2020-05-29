import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as a from './search.actions';
import { of } from 'rxjs';
import { JiraService } from '../../lib/jira.service';
import { CachingService } from 'src/app/lib/caching.service';
import { populateFieldValuesCompact, detailFields, populatedFieldList } from 'src/app/lib/jira-tree-utils';

@Injectable()
export class SearchEffects {
    constructor(
        private actions$: Actions,
        private jiraService: JiraService) { }

    @Effect() loadSearchlist = this.actions$.pipe(ofType(a.ActionTypes.LoadSearchResults),
        switchMap((action: any) =>
            this.jiraService.executeJql(action.payload.query, action.payload.currentPageIndex - 1, 50,
                populatedFieldList, 'issuelist.json')
                .pipe(map((p: any) => {
                    return {
                        total: p.total,
                        startAt: p.startAt,
                        endAt: ((p.startAt + p.maxResults) < p.total) ? p.startAt + p.maxResults : p.total,
                        pageSize: p.maxResults,
                        results: _.map(p.issues, p => populateFieldValuesCompact(p))
                    }
                }))
                .pipe(
                    map(payload => ({ type: a.ActionTypes.LoadSearchResultsSuccess, payload })),
                    catchError(() => of({ type: a.ActionTypes.LoadSearchResultsFailed }))
                )
        )
    );

    @Effect() loadSaveSearchlist = this.actions$.pipe(ofType(a.ActionTypes.LoadSavedSearchlist),
        switchMap(() =>
            this.jiraService.favouriteSearches('favourite-search.json')
                .pipe(
                    map(payload => ({ type: a.ActionTypes.LoadSavedSearchlistSuccess, payload })),
                    catchError(() => of({ type: a.ActionTypes.LoadSavedSearchlistFailed }))
                )
        )
    );

    @Effect() loadSearchResultRoadmapNode = this.actions$.pipe(ofType(a.ActionTypes.LoadSearchResultRoadmapNode),
        switchMap((action: any) =>
            this.jiraService.loadEpicChildren$(action.payload)
                .pipe(
                    map(payload => ({ type: a.ActionTypes.LoadSearchResultRoadmapNodeSuccess, payload: { issueKey: action.payload, payload } })),
                    catchError(() => of({ type: a.ActionTypes.LoadSearchResultRoadmapNodeFailed }))
                )
        )
    );

}
