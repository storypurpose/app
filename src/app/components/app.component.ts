import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Router, NavigationEnd } from '@angular/router';
import { PersistenceService } from '../lib/persistence.service';
import { Subscription } from 'rxjs';
import { DomSanitizer, Title } from '@angular/platform-browser';

import { environment } from '../../environments/environment';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import {
  SetModeAction, ModeTypes, ShowConnectionEditorAction,
  SetConnectionDetailsAction, LoadProjectsAction, SetOrganizationAction, SetExtendedHierarchyDetailsAction, ToggleQueryEditorVisibilityAction
} from '../+state/app.actions';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { GapiSession } from '../googledrive/gapi.session';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  isNavbarCollapsed = true;
  showConnectionEditor = false;
  showCustomFieldSetup = false;
  showProjectConfigSetup = false;

  issue: string;

  connectionDetails: any;

  connectionEditorVisible$: Subscription;
  projectConfigSubscription: Subscription;

  connectionDetails$: Subscription;
  projectsSubscription: Subscription;

  issueType: string;

  menulist: any;
  mode$: Subscription;
  isOnlineMode = false;

  @ViewChild('connectionDetailPopover', { static: true }) connectionDetailPopover: NgbPopover;

  public showDisplayName = false;

  constructor(public router: Router,
    public titleService: Title,
    public sanitizer: DomSanitizer,
    public persistenceService: PersistenceService,
    public store$: Store<AppState>,
    public gapiSession: GapiSession
  ) {

    if (environment.production) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          gtag('config', environment.gacode, { 'page_path': event.urlAfterRedirects });
        }
      })
    }
  }


  ngOnInit() {

    this.titleService.setTitle(environment.appTitle);

    this.menulist = [
      { label: 'Setup connection', icon: 'pi pi-cog', command: () => this.showConnectionEditor = true },
      { label: 'Custom fields', icon: 'pi pi-sliders-h', command: () => this.showCustomFieldSetup = true },
    ];

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

  onModeChanged(isOnlineMode) {
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
}
