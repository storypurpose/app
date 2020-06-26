import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import * as a from './common.actions';
import { of } from 'rxjs';
import { JiraService } from 'src/app/lib/jira.service';
import * as _ from 'lodash';

@Injectable()
export class CommonEffects {
  constructor(private actions$: Actions, private jiraService: JiraService) { }

  @Effect() loadComments = this.actions$.pipe(ofType(a.ActionTypes.LoadComments),
    switchMap((action: any) =>
      this.jiraService.getComments(action.payload)
        .pipe(
          map(payload => ({ type: a.ActionTypes.LoadCommentsSuccess, payload })),
          catchError(() => of({ type: a.ActionTypes.LoadCommentsFailed }))
        )
    )
  );
}
