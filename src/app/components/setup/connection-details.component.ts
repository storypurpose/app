import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { JiraService, AuthenticationModeTypes } from '../../lib/jira.service';
import * as _ from 'lodash';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { environment } from '../../../environments/environment';
import { MessageService } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { SetConnectionDetailsAction } from 'src/app/+state/app.actions';

@Component({
    selector: 'app-connection-details',
    templateUrl: './connection-details.component.html'
})
export class ConnectionDetailsComponent implements OnInit {
    @Output() close = new EventEmitter<any>();
    @Input() connectionDetails: any;

    hideWhatDoYouUse = true;
    allowOfflineMode = false;
    testSuccessful = false;
    authMode = AuthenticationModeTypes;

    constructor(public jiraService: JiraService,
        public persistenceService: PersistenceService,
        public messageService: MessageService,
        public store$: Store<AppState>) {
    }

    ngOnInit() {
        this.allowOfflineMode = !environment.production;
        this.connectionDetails.authenticationType = AuthenticationModeTypes.JiraCloud;
    }

    canSave() {
        return this.connectionDetails.offlineMode ||
            (this.connectionDetails && this.connectionDetails.serverUrl && this.connectionDetails.serverUrl.length > 0
                && this.connectionDetails.username && this.connectionDetails.username.length > 0
                && this.connectionDetails.password && this.connectionDetails.password.length > 0)
    }
    onSave() {
        this.persistenceService.setConnectionDetails(this.connectionDetails);
        this.store$.dispatch(new SetConnectionDetailsAction(this.connectionDetails));
        this.onClose(false);

        // this.onClose(true);
    }
    onClose(shouldReload) {
        this.close.emit(shouldReload);
    }
    onServerUrlKeyup(evt: any) {
        console.log('onServerUrlKeyup', /atlassian.net/i.test(evt.target.value));
    }

    testConnection() {
        this.jiraService.testConnection(this.connectionDetails)
            .subscribe((result: any) => {
                this.connectionDetails.displayName = result.displayName;
                this.messageService.add({ severity: "success", summary: "Success", detail: "Connection tested successfully", life: 5000, closable: true });
                this.testSuccessful = true;
            });
        // this.messageService.add({ severity: 'error', summary: "Failed", detail: "Connection failed", life: 10000, closable: true });
    }

    onReset() {
        this.persistenceService.resetConnectionDetails();
        this.onClose(true);
    }
}
