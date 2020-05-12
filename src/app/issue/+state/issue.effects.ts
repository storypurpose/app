import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as a from './issue.actions';
import { of } from 'rxjs';
import { JiraService } from '../../lib/jira.service';
import { CachingService } from 'src/app/lib/caching.service';
import { flattenNodes, appendExtendedFields } from 'src/app/lib/jira-tree-utils';

@Injectable()
export class IssueEffects {
    constructor(
        private actions$: Actions,
        private jiraService: JiraService,
        private cachingService: CachingService
    ) { }

    @Effect() loadPrimaryIssue = this.actions$.pipe(ofType(a.ActionTypes.LoadPrimaryIssue),
        switchMap((action: any) =>
            this.getIssueDetails(action.payload)
                .pipe(
                    map(payload => ({ type: a.ActionTypes.LoadPrimaryIssueSuccess, payload })),
                    catchError(() => of({ type: a.ActionTypes.LoadPrimaryIssueFailed }))
                )
        )
    );

    @Effect() loadSelectedIssue = this.actions$.pipe(ofType(a.ActionTypes.LoadSelectedIssue),
        switchMap((action: any) =>
            this.getIssueDetails(action.payload)
                .pipe(
                    map(payload => ({ type: a.ActionTypes.LoadSelectedIssueSuccess, payload })),
                    catchError(() => of({ type: a.ActionTypes.LoadSelectedIssueFailed }))
                )
        )
    );

    @Effect() loadEpicChildren = this.actions$.pipe(ofType(a.ActionTypes.LoadEpicChildren),
        switchMap((action: any) =>
            this.jiraService.executeJql(`'epic Link'=${action.payload}`, 0, 100, null, 'epic-children.json')
                .pipe(
                    map(result => ({ type: a.ActionTypes.LoadEpicChildrenSuccess, payload: result })),
                    catchError(() => of({ type: a.ActionTypes.LoadEpicChildrenFailed }))
                )
        )
    );

    @Effect() loadRelatedLinks = this.actions$.pipe(ofType(a.ActionTypes.LoadRelatedLinks),
        switchMap((action: any) =>
            this.jiraService.executeJql(`key in (${_.join(action.payload, ',')})`, 0, 100,
                ['components', 'labels', 'fixVersions'], 'linked-issues.json')
                .pipe(
                    map(result => ({ type: a.ActionTypes.LoadRelatedLinksSuccess, payload: result })),
                    catchError(() => of({ type: a.ActionTypes.LoadRelatedLinksFailed }))
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


    @Effect() loadProjectConfig = this.actions$.pipe(ofType(a.ActionTypes.LoadProjectDetails),
        switchMap((action: any) =>
            this.jiraService.getProjectDetails(action.payload)
                .pipe(
                    map(result => {
                        let payload = null;
                        if (result && result.length > 0) {
                            payload = result[0];
                            payload.customFields =
                                _.sortBy(_.map(_.filter(result[1], { custom: true }), (ff) => _.pick(ff, ['id', 'name'])), ['name']);
                        }
                        return ({ type: a.ActionTypes.LoadProjectDetailsSuccess, payload })
                    }),
                    catchError(() => of({ type: a.ActionTypes.LoadProjectDetailsFailed }))
                )
        )
    );

    @Effect() updateFixVersions = this.actions$.pipe(ofType(a.ActionTypes.UpdateFieldValue),
        switchMap((action: any) =>
            this.jiraService.updateFieldValue$(action.payload)
                .pipe(
                    map(() => ({ type: a.ActionTypes.UpdateFieldValueSuccess, payload: action.payload })),
                    catchError(() => of({ type: a.ActionTypes.UpdateFieldValueFailed }))
                )
        )
    );

    private getIssueDetails(payload: any) {
        return this.jiraService.getIssueDetails(payload.issue, _.map(payload.extendedFields, 'id'))
            .pipe(map((result: any) => {
                const issueDetails = {
                    issue: result,
                    extendedFields: payload.extendedFields,
                    organization: this.cachingService.getOrganization(),
                    projectConfig: null
                };
                if (result && result.fields && result.fields.project &&
                    result.fields.project.key && result.fields.project.key.length > 0) {
                    issueDetails.projectConfig = this.cachingService.getProjectDetails(result.fields.project.key);
                }
                return issueDetails;
            }));
    }
}
