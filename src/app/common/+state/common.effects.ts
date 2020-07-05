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
  @Effect() addComment = this.actions$.pipe(ofType(a.ActionTypes.AddComment),
    switchMap((action: any) =>
      this.jiraService.addComment(action.payload)
        .pipe(
          map(payload => ({ type: a.ActionTypes.AddCommentSuccess, payload })),
          catchError(() => of({ type: a.ActionTypes.AddCommentFailed }))
        )
    )
  );

  @Effect() loadSubtasks = this.actions$.pipe(ofType(a.ActionTypes.LoadSubtasks),
    switchMap((action: any) =>
      this.jiraService.executeJql(`issuetype in (${action.payload.subTaskIssueTypes}) AND parent=${action.payload.issueKey}`,
        0, 100, _.map(action.payload.extendedFields, 'id'), 'test-cases.json')
        .pipe(
          map(result => ({ type: a.ActionTypes.LoadSubtasksSuccess, payload: { result, extendedFields: action.payload.extendedFields } })),
          catchError(() => of({ type: a.ActionTypes.LoadSubtasksFailed }))
        )
    )
  );

  @Effect() loadIssueLinkTypes = this.actions$.pipe(ofType(a.ActionTypes.LoadIssueLinkTypes),
    switchMap((action: any) =>
      this.jiraService.getIssueLinkTypes()
        .pipe(
          map(payload => ({ type: a.ActionTypes.LoadIssueLinkTypesSuccess, payload })),
          catchError(() => of({ type: a.ActionTypes.LoadIssueLinkTypesFailed }))
        )
    )
  );

  @Effect() loadCreateIssueMetadata = this.actions$.pipe(ofType(a.ActionTypes.LoadCreateIssueMetadata),
    switchMap((action: any) =>
      this.jiraService.getCreateIssueMetadata(action.payload)
        .pipe(
          map(fields => ({ type: a.ActionTypes.LoadCreateIssueMetadataSuccess, payload: this.transformCreateIssueMetadata(fields) })),
          catchError(() => of({ type: a.ActionTypes.LoadCreateIssueMetadataFailed }))
        )
    )
  );

  private transformCreateIssueMetadata(fields: any): any[] {
    const result = _.filter(_.toArray(fields), { required: true });
    
    return result;
  }
}
