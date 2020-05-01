import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Router, NavigationEnd } from '@angular/router';
import { PersistenceService } from '../lib/persistence.service';
import { Subscription, Observable } from 'rxjs';
import { DomSanitizer, Title } from '@angular/platform-browser';

import { environment } from '../../environments/environment';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import {
  SetModeAction, ModeTypes, ShowConnectionEditorAction,
  SetConnectionDetailsAction, LoadProjectsAction, SetOrganizationAction, SetExtendedHierarchyDetailsAction, ShowQueryEditorAction as ToggleQueryEditorVisibilityAction
} from '../+state/app.actions';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { GapiSession } from '../googledrive/gapi.session';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  searchVisible = false;
  isNavbarCollapsed = true;
  showConnectionEditor = false;
  showCustomFieldSetup = false;
  showProjectConfigSetup = false;

  issue: string;

  allowOfflineMode = false;
  isOnlineMode = false;
  connectionDetails: any;

  queryEditorVisible$: Subscription;
  query$: Subscription;
  query = "";

  connectionEditorVisible$: Subscription;
  projectConfigSubscription: Subscription;
  mode$: Subscription;

  connectionDetails$: Subscription;
  projectsSubscription: Subscription;

  issueType: string;

  menulist: any;

  @ViewChild('connectionDetailPopover', { static: true }) connectionDetailPopover: NgbPopover;

  public isCollapsed = true;
  public showDisplayName = false;

  queryContext: any;
  queryContextQuery$: Observable<any>;
  queryExecutorVisibleQuery$: Observable<any>;
  isQueryExecutorVisible = false;

  constructor(public router: Router,
    public titleService: Title,
    public persistenceService: PersistenceService,
    public sanitizer: DomSanitizer,
    public store$: Store<AppState>,
    public gapiSession: GapiSession, ) {

    if (environment.production) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          gtag('config', environment.gacode, { 'page_path': event.urlAfterRedirects });
        }
      })
    } else {
      this.allowOfflineMode = true;
    }
  }


  ngOnInit() {

    this.titleService.setTitle(environment.appTitle);

    this.menulist = [
      { label: 'Setup connection', icon: 'pi pi-cog', command: () => this.showConnectionEditor = true },
      { label: 'Custom fields', icon: 'pi pi-sliders-h', command: () => this.showCustomFieldSetup = true },
    ];

    this.query$ = this.store$.select(p => p.app.query).pipe(filter(p => p && p.length > 0))
      .subscribe(query => this.query = query);

    this.queryEditorVisible$ = this.store$.select(p => p.app.queryEditorVisible)
      .subscribe(show => this.searchVisible = show);

    this.connectionEditorVisible$ = this.store$.select(p => p.app.connectionEditorVisible)
      .subscribe(show => this.showConnectionEditor = show);
    this.mode$ = this.store$.select(p => p.app.mode)
      .subscribe(p => this.isOnlineMode = p && p === ModeTypes.Online);
    this.connectionDetails$ = this.store$.select(p => p.app.connectionDetails)
      .subscribe(p => this.connectionDetails = p);

    this.initiatizeConnectionDetailsState(this.persistenceService.getConnectionDetails());
    this.initiatizeModeState(this.persistenceService.getMode());
    this.initiatizeProjectState(this.persistenceService.getProjects());
    this.initiatizeOrganizationState(this.persistenceService.getOrganization());
    this.initiatizeExtendedHierarchyState(this.persistenceService.getExtendedHierarchy());
  }

  ngOnDestroy() {
    this.queryEditorVisible$ ? this.queryEditorVisible$.unsubscribe() : null;
    this.query$ ? this.query$.unsubscribe() : null;
    this.connectionEditorVisible$ ? this.connectionEditorVisible$.unsubscribe() : null;
    this.mode$ ? this.mode$.unsubscribe() : null;

    this.connectionDetails$ ? this.connectionDetails$.unsubscribe() : null;
  }

  navigateTo(issue) {
    this.router.navigate([issue]);
  }

  connectionDetailsSetupCompleted() {
    this.store$.dispatch(new ShowConnectionEditorAction(false));
  }

  onModeChange(isOnlineMode) {
    this.initiatizeModeState(isOnlineMode ? ModeTypes.Online : ModeTypes.Offline);
    window.location.reload();
  }

  initiatizeModeState(mode) {
    this.persistenceService.setMode(mode);
    this.store$.dispatch(new SetModeAction(mode));
  }
  initiatizeConnectionDetailsState(details) {
    if (details) {
      this.store$.dispatch(new SetConnectionDetailsAction(details));
      this.persistenceService.setConnectionDetails(_.clone(details));
    }
  }

  initiatizeProjectState(projects) {
    if (projects && projects.length > 0) {
      this.store$.dispatch(new LoadProjectsAction(projects));
    }
  }
  initiatizeOrganizationState(organization) {
    if (organization) {
      this.store$.dispatch(new SetOrganizationAction(organization));
    }
  }
  initiatizeExtendedHierarchyState(extendedHierarchy) {
    if (extendedHierarchy) {
      this.store$.dispatch(new SetExtendedHierarchyDetailsAction(extendedHierarchy));
    }
  }
  signIn() {
    this.gapiSession.signIn()
      .then(() => {
        if (this.gapiSession.isSignedIn) {
          window.location.reload();
        }
      });
  }

  toggleSearchEditorVisibility() {
    this.store$.dispatch(new ToggleQueryEditorVisibilityAction(!this.searchVisible));
  }
  canExecuteQuery = () => this.query && this.query.trim().length > 0;
  executeQuery() {
    if (this.canExecuteQuery()) {
      this.router.navigate(["/search/list"], { queryParams: { query: this.query } });
    }
  }

}
