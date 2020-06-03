import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer, Title } from '@angular/platform-browser';

import { environment } from '../../environments/environment';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { SetModeAction, ModeTypes, ShowConnectionEditorAction, BootstrapAppAction, ShowOrganizationEditorAction } from '../+state/app.actions';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { GapiSession } from '../googledrive/gapi.session';
import { MessageService } from 'primeng/api';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  showOrganizationEditor = false;
  isNavbarCollapsed = true;
  showConnectionEditor = false;
  showCustomFieldSetup = false;
  showProjectConfigSetup = false;

  issue: string;

  connectionDetails: any;

  messageObserver$: Subscription;

  connectionEditorVisible$: Subscription;
  organizationEditorVisible$: Subscription;
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
    public store$: Store<AppState>,
    public gapiSession: GapiSession,
    private messageService: MessageService
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

    this.messageObserver$ = this.messageService.messageObserver
      .pipe(filter((p: any) => p && p.data && p.data.showAuth))
      .subscribe(() => this.store$.dispatch(new ShowConnectionEditorAction(true)));

    this.connectionEditorVisible$ = this.store$.select(p => p.app.connectionEditorVisible)
      .subscribe(show => this.showConnectionEditor = show);

    this.organizationEditorVisible$ = this.store$.select(p => p.app.organizationEditorVisible)
      .subscribe(show => this.showOrganizationEditor = show);

    this.mode$ = this.store$.select(p => p.app.mode)
      .subscribe(p => this.isOnlineMode = p && p === ModeTypes.Online);
    this.connectionDetails$ = this.store$.select(p => p.app.connectionDetails)
      .subscribe(p => this.connectionDetails = p);

    this.store$.dispatch(new BootstrapAppAction(null));
  }

  ngOnDestroy() {
    this.messageObserver$ ? this.messageObserver$.unsubscribe() : null;
    this.connectionEditorVisible$ ? this.connectionEditorVisible$.unsubscribe() : null;
    this.organizationEditorVisible$ ? this.organizationEditorVisible$.unsubscribe() : null;
    this.mode$ ? this.mode$.unsubscribe() : null;

    this.connectionDetails$ ? this.connectionDetails$.unsubscribe() : null;
  }

  navigateTo = (issue) => this.router.navigate([issue]);

  connectionDetailsSetupCompleted = () => this.store$.dispatch(new ShowConnectionEditorAction(false));
  organizationSetupCompleted = () => this.store$.dispatch(new ShowOrganizationEditorAction(false));
  onModeChanged(isOnlineMode) {
    this.store$.dispatch(new SetModeAction(isOnlineMode ? ModeTypes.Online : ModeTypes.Offline));
    window.location.reload();
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
