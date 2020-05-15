import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as a from './search.actions';
import { of } from 'rxjs';
import { JiraService } from '../../lib/jira.service';
import { CachingService } from 'src/app/lib/caching.service';

@Injectable()
export class SearchEffects {
    constructor(
        private actions$: Actions,
        private jiraService: JiraService    ) { }

    @Effect() loadSaveSearchlist = this.actions$.pipe(ofType(a.ActionTypes.LoadSavedSearchlist),
        switchMap(() =>
            this.jiraService.favouriteSearches('favourite-search.json')
                .pipe(
                    map(payload => ({ type: a.ActionTypes.LoadSavedSearchlistSuccess, payload })),
                    catchError(() => of({ type: a.ActionTypes.LoadSavedSearchlistFailed }))
                )
        )
    );
}
