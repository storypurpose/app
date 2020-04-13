import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Router, NavigationEnd } from '@angular/router';
import { PersistenceService } from '../lib/persistence.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { environment } from '../../environments/environment';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { SetModeAction, ModeTypes, SetConnectionDetailsAction, LoadProjectsAction, ShowConnectionEditorAction } from '../+state/app.actions';
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

  allowOfflineMode = false;
  isOnlineMode = false;
  connectionDetails: any;
  // fieldMapping: any;

  connectionSubscription: Subscription;
  customFieldSubscription: Subscription;
  projectConfigSubscription: Subscription;
  modeSubscription: Subscription;

  connectionDetailsSubscription: Subscription;
  // fieldMappingSubscription: Subscription;
  projectsSubscription: Subscription;

  issueType: string;

  menulist: any;

  @ViewChild('connectionDetailPopover', { static: true }) connectionDetailPopover: NgbPopover;


  constructor(public router: Router,
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
    this.menulist = [
      { label: 'Setup connection', icon: 'pi pi-cog', command: () => this.showConnectionEditor = true },
      { label: 'Custom fields', icon: 'pi pi-sliders-h', command: () => this.showCustomFieldSetup = true },
    ];

    this.connectionSubscription = this.store$.select(p => p.app.connectionEditorVisible)
      .subscribe(show => {
        this.showConnectionEditor = show;
        //(show) ? this.connectionDetailPopover.open() : this.connectionDetailPopover.close();
      });

    // this.customFieldSubscription = this.store$.select(p => p.app.customFieldEditorVisible)
    //   .pipe(filter(issueType => issueType))
    //   .subscribe(issueType => {
    //     this.showCustomFieldSetup = true;
    //     this.issueType = issueType;
    //   });

    this.modeSubscription = this.store$.select(p => p.app.mode)
      .subscribe(p => this.isOnlineMode = p && p === ModeTypes.Online);
    this.connectionDetailsSubscription = this.store$.select(p => p.app.connectionDetails)
      .subscribe(p => this.connectionDetails = p);
    this.initiatizeConnectionDetailsState(this.persistenceService.getConnectionDetails());
    this.initiatizeModeState(this.persistenceService.getMode());
    this.initiatizeProjectState(this.persistenceService.getProjects());
  }

  ngOnDestroy() {
    this.connectionSubscription ? this.connectionSubscription.unsubscribe() : null;
    this.customFieldSubscription ? this.customFieldSubscription.unsubscribe() : null;
    this.modeSubscription ? this.modeSubscription.unsubscribe() : null;

    this.connectionDetailsSubscription ? this.connectionDetailsSubscription.unsubscribe() : null;
  }

  navigateTo(issue) {
    this.router.navigate([issue]);
  }

  openConnectionDetailEditor() {
    this.store$.dispatch(new ShowConnectionEditorAction(true));
  }
  connectionDetailsSetupCompleted(showReload) {
    this.store$.dispatch(new ShowConnectionEditorAction(false));
    // if (showReload) {
    //   window.location.reload();
    // }
  }

  // customFieldSetupCompleted(reload) {
  //   this.showCustomFieldSetup = false;
  //   if (reload) {
  //     window.location.reload();
  //   }
  // }

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
    if (projects) {
      this.store$.dispatch(new LoadProjectsAction(projects));
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
