import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, NavigationEnd } from '@angular/router';
import { PersistenceService } from '../lib/persistence.service';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { environment } from '../../environments/environment';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { ShowConnectionEditorAction } from '../+state/app.actions';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  showConnectionEditor = false;
  showCustomFieldSetup = false;
  showConfigSetup = false;
  issue: string;
  connectionDetails: any;
  connectionSubscription: Subscription;
  isOnlineMode = true;

  customFieldSubscription: Subscription;
  issueTypeToConfigure: string;

  menulist: any;
  constructor(public router: Router,
    public persistenceService: PersistenceService,
    public sanitizer: DomSanitizer,
    public store$: Store<AppState>) {

    if (environment.production) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          gtag('config', environment.gacode, { 'page_path': event.urlAfterRedirects });
        }
      })
    }
  }


  ngOnInit() {
    this.menulist = [
      { label: 'Setup connection', icon: 'pi pi-cog', command: () => this.showConnectionEditor = true },
      { label: 'Custom fields', icon: 'pi pi-sliders-h', command: () => this.showCustomFieldSetup = true },
    ];

    this.connectionSubscription = this.store$.select(p => p.app)
      .pipe(filter(p => p && p.connectionEditorVisible), map(p => p.connectionEditorVisible))
      .subscribe(show => this.showConnectionEditor = show);

    this.customFieldSubscription = this.store$.select(p => p.app)
      .pipe(filter(p => p && p.customFieldEditorVisible), map(p => p.customFieldEditorVisible))
      .subscribe(issueType => {
        this.showCustomFieldSetup = true;
        this.issueTypeToConfigure = issueType;
      });

    this.connectionDetails = this.persistenceService.getConnectionDetails();
    if (this.connectionDetails && this.connectionDetails.offlineMode) {
      this.isOnlineMode = false;
    }
  }

  ngOnDestroy() {
    this.connectionSubscription ? this.connectionSubscription.unsubscribe() : null;
    this.customFieldSubscription ? this.customFieldSubscription.unsubscribe() : null;
  }

  navigateTo(issue) {
    this.router.navigate([issue]);
  }

  connectionDetailsSetupCompleted(showReload) {
    this.showConnectionEditor = false;
    if (showReload) {
      window.location.reload();
    }
  }

  customFieldSetupCompleted() {
    this.showCustomFieldSetup = false;
    window.location.reload();
  }

  configSetupCompleted() {
    this.showConfigSetup = false;
    window.location.reload();
  }

  onModeChange(isOnlineMode) {
    this.connectionDetails.offlineMode = !isOnlineMode;
    this.persistenceService.setConnectionDetails(this.connectionDetails);
    if (isOnlineMode) {
      this.store$.dispatch(new ShowConnectionEditorAction(true));
    } else {
      window.location.reload();
    }
  }
}
