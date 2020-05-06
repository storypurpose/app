import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, withLatestFrom, take, filter, tap } from 'rxjs/operators';
import * as a from './app.actions';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from './app.state';
import { JiraService } from '../lib/jira.service';

@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private jiraService: JiraService
  ) { }

//   @Effect() updateFixVersions = this.actions$.pipe(ofType(a.ActionTypes.ImportEntityTemplates),
//     switchMap((action: any) =>
//       this.jiraService.uploadEntityTemplates$(action.payload)
//         .pipe(
//           map(list => ({ type: a.ActionTypes.ImportEntityTemplatesSuccess, payload: list })),
//           catchError(() => of({ type: a.ActionTypes.ImportEntityTemplatesFailed }))
//         )
//     )
//   );

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
