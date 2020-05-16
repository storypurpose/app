import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import * as a from './app.actions';
import { of } from 'rxjs';
import { CachingService } from '../lib/caching.service';
import { JiraService } from '../lib/jira.service';
import * as _ from 'lodash';

@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,
    private jiraService: JiraService,
    private cachingService: CachingService
  ) { }

  @Effect() verifyCurrentSession = this.actions$.pipe(ofType(a.ActionTypes.VerifyCurrentSession),
    switchMap((action: any) => {
      const connectionDetails = this.cachingService.getConnectionDetails();
      return this.testConnection$(connectionDetails, a.ActionTypes.VerifyCurrentSessionComplete);
    })
  );

  @Effect() verifyConnectionDetails = this.actions$.pipe(ofType(a.ActionTypes.VerifyConnectionDetails),
    switchMap((action: any) => this.testConnection$(action.payload, a.ActionTypes.VerifyConnectionDetailsComplete))
  );

  @Effect() upsertProject = this.actions$.pipe(ofType(a.ActionTypes.UpsertProject),
    switchMap((action: any) => {
      this.cachingService.setProjectDetails(action.payload);
      return of({ type: a.ActionTypes.UpsertProjectSuccess, payload: action.payload })
    })
  );

  @Effect() dismissProjectSetup = this.actions$.pipe(ofType(a.ActionTypes.DismissProjectSetup),
    switchMap((action: any) => {
      action.payload.isConfigured = true;
      this.cachingService.setProjectDetails(action.payload);
      return of({ type: a.ActionTypes.UpsertProjectSuccess, payload: action.payload })
    })
  );

  @Effect() bootstrapApp = this.actions$.pipe(ofType(a.ActionTypes.BootstrapApp),
    switchMap((action: any) => {
      const payload = {
        connectionDetails: this.cachingService.getConnectionDetails(),
        mode: this.cachingService.getMode(),
        projects: this.cachingService.getProjects(),
        organization: this.cachingService.getOrganization(),
        extendedHierarchy: this.cachingService.getExtendedHierarchy()
      };

      return of({ type: a.ActionTypes.BootstrapAppSuccess, payload })
    })
  );

  @Effect() setMode = this.actions$.pipe(ofType(a.ActionTypes.SetMode),
    switchMap((action: any) => {
      const payload = action.payload;
      this.cachingService.setMode(payload);
      return of({ type: a.ActionTypes.SetModeSuccess, payload })
    })
  );

  @Effect() setConnectionDetails = this.actions$.pipe(ofType(a.ActionTypes.SetConnectionDetails),
    switchMap((action: any) => {
      const payload = action.payload;
      this.cachingService.setConnectionDetails(payload);
      return of({ type: a.ActionTypes.SetConnectionDetailsSuccess, payload })
    })
  );
  @Effect() setOrganization = this.actions$.pipe(ofType(a.ActionTypes.SetOrganization),
    switchMap((action: any) => {
      const payload = action.payload;
      this.cachingService.setOrganization(payload);
      return of({ type: a.ActionTypes.SetOrganizationSuccess, payload })
    })
  );
  @Effect() setExtendedHierarchy = this.actions$.pipe(ofType(a.ActionTypes.SetExtendedHierarchyDetails),
    switchMap((action: any) => {
      const payload = action.payload;
      this.cachingService.setExtendedHierarchy(payload);
      return of({ type: a.ActionTypes.SetExtendedHierarchyDetailsSuccess, payload })
    })
  );

  @Effect() setProjects = this.actions$.pipe(ofType(a.ActionTypes.SetProjects),
    switchMap((action: any) => {
      const payload = action.payload;
      this.cachingService.setProjects(payload);
      return of({ type: a.ActionTypes.SetProjectsSuccess, payload })
    })
  );

  private testConnection$(connectionDetails: any, type) {
    if (!connectionDetails || !connectionDetails.serverUrl || connectionDetails.serverUrl.trim().length === 0) {
      return of({ type, payload: { verified: false } });
    }
    const payload = connectionDetails;

    return this.jiraService.testConnection(connectionDetails)
      .pipe(map((user: any) => {
        payload.verified = true;
        payload.displayName = user.displayName;
        this.cachingService.setConnectionDetails(_.clone(payload));
        return ({ type, payload });
      }), catchError(() => {
        payload.verified = false;
        payload.password = null;
        this.cachingService.setConnectionDetails(_.clone(payload));
        return of({ type, payload });
      }));
  }
}
