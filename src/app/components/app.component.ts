import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, NavigationEnd } from '@angular/router';
import { PersistenceService } from '../lib/persistence.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { environment } from '../../environments/environment';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { SetModeAction, ModeTypes, SetConnectionDetailsAction, SetFieldMappingAction } from '../+state/app.actions';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  isNavbarCollapsed = true;
  showConnectionEditor = false;
  showCustomFieldSetup = false;

  issue: string;

  allowOfflineMode = false;
  isOnlineMode = false;
  connectionDetails: any;
  fieldMapping: any;

  connectionSubscription: Subscription;
  customFieldSubscription: Subscription;
  modeSubscription: Subscription;
  connectionDetailsSubscription: Subscription;
  fieldMappingSubscription: Subscription;

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
      .pipe(filter(show => show === true))
      .subscribe(show => this.showConnectionEditor = show);

    this.customFieldSubscription = this.store$.select(p => p.app.customFieldEditorVisible)
      .pipe(filter(show => show))
      .subscribe(show => {
        this.showCustomFieldSetup = true;
        this.issueTypeToConfigure = show;
      });

    this.modeSubscription = this.store$.select(p => p.app.mode)
      .subscribe(p => this.isOnlineMode = p && p === ModeTypes.Online);
    this.connectionDetailsSubscription = this.store$.select(p => p.app.connectionDetails)
      .subscribe(p => this.connectionDetails = p);
    this.fieldMappingSubscription = this.store$.select(p => p.app.fieldMapping)
      .subscribe(p => this.fieldMapping = p);

    this.initiatizeFieldMappingState(this.persistenceService.getFieldMapping());
    this.initiatizeConnectionDetailsState(this.persistenceService.getConnectionDetails());
    this.initiatizeModeState(this.persistenceService.getMode());
  }

  ngOnDestroy() {
    this.connectionSubscription ? this.connectionSubscription.unsubscribe() : null;
    this.customFieldSubscription ? this.customFieldSubscription.unsubscribe() : null;
    this.modeSubscription ? this.modeSubscription.unsubscribe() : null;

    this.connectionDetailsSubscription ? this.connectionDetailsSubscription.unsubscribe() : null;
    this.fieldMappingSubscription ? this.fieldMappingSubscription.unsubscribe() : null;
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

  customFieldSetupCompleted(reload) {
    this.showCustomFieldSetup = false;
    if (reload) {
      window.location.reload();
    }
  }

  onModeChange(isOnlineMode) {
    this.initiatizeModeState(isOnlineMode ? ModeTypes.Online : ModeTypes.Offline);
  }

  initiatizeModeState(mode) {
    this.persistenceService.setMode(mode);
    this.store$.dispatch(new SetModeAction(mode));
  }
  initiatizeConnectionDetailsState(details) {
    if (details) {
      this.persistenceService.setConnectionDetails(details);
      this.store$.dispatch(new SetConnectionDetailsAction(details));
    }
  }
  initiatizeFieldMappingState(details) {
    if (details) {
      this.persistenceService.setFieldMapping(details);
      this.store$.dispatch(new SetFieldMappingAction(details));
    }
  }

}
