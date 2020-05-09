import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, withLatestFrom, take, filter, tap } from 'rxjs/operators';
import * as a from './issue.actions';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { IssueState } from './issue.state';
import { JiraService } from '../../lib/jira.service';

@Injectable()
export class IssueEffects {
    constructor(
        private actions$: Actions,
        private store$: Store<IssueState>,
        private jiraService: JiraService
    ) { }

    @Effect() updateFixVersions = this.actions$.pipe(ofType(a.ActionTypes.UpdateFieldValue),
        switchMap((action: any) =>
            this.jiraService.updateFieldValue$(action.payload)
                .pipe(
                    map(list => ({ type: a.ActionTypes.UpdateFieldValueSuccess, payload: list })),
                    catchError(() => of({ type: a.ActionTypes.UpdateFieldValueFailed }))
                )
        )
    );

    //   @Effect() loadFieldConfiguration = this.actions$.pipe(ofType(a.ActionTypes.LoadFieldConfigurationBegin),
    //     switchMap((action: any) =>
    //       this.jiraService.getFieldConfiguration$(action.payload)
    //         .pipe(
    //           map(result => ({ type: a.ActionTypes.LoadFieldConfigurationSuccess, payload: result })),
    //           catchError(() => of({ type: a.ActionTypes.LoadFieldConfigurationFailed }))
    //         )
    //     )
    //   );
}
