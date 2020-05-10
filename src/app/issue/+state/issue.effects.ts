import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as a from './issue.actions';
import { of } from 'rxjs';
import { JiraService } from '../../lib/jira.service';
import { CachingService } from 'src/app/lib/caching.service';

@Injectable()
export class IssueEffects {
    constructor(
        private actions$: Actions,
        private jiraService: JiraService,
        private cachingService: CachingService
    ) { }

    @Effect() loadIssueDetails = this.actions$.pipe(ofType(a.ActionTypes.LoadIssueDetails),
        switchMap((action: any) =>
            this.jiraService.getIssueDetails(action.payload)
                .pipe(
                    map((result: any) => {
                        const payload = {
                            issue: result,
                            organization: this.cachingService.getOrganization(),
                            projectConfig: null
                        }
                        if (result && result.fields && result.fields.project &&
                            result.fields.project.key && result.fields.project.key.length > 0) {
                            payload.projectConfig = this.cachingService.getProjectDetails(result.fields.project.key);
                        }
                        return ({ type: a.ActionTypes.LoadIssueDetailsSuccess, payload });
                    }),
                    catchError(() => of({ type: a.ActionTypes.LoadIssueDetailsFailed }))
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

    @Effect() loadProjectConfig = this.actions$.pipe(ofType(a.ActionTypes.LoadProjectDetails),
        switchMap((action: any) =>
            this.jiraService.getProjectDetails(action.payload)
                .pipe(
                    map(result => {
                        let payload = null;
                        if (result && result.length > 0) {
                            payload = result[0];
                            payload.customFields = _.sortBy(_.map(_.filter(result[1], { custom: true }), (ff) => _.pick(ff, ['id', 'name'])), ['name']);
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
}
