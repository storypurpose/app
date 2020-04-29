import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { JiraService, AuthenticationModeTypes } from '../../lib/jira.service';
import * as _ from 'lodash';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { MessageService } from 'primeng/api';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { SetConnectionDetailsAction, ConnectionDetailsVerifiedAction } from 'src/app/+state/app.actions';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-connection-details',
    templateUrl: './connection-details.component.html'
})
export class ConnectionDetailsComponent implements OnInit {
    @Output() close = new EventEmitter<any>();
    @Input() connectionDetails: any;

    hideWhatDoYouUse = true;
    testSuccessful = false;
    authMode = AuthenticationModeTypes;

    constructor(public jiraService: JiraService,
        public persistenceService: PersistenceService,
        public messageService: MessageService,
        public store$: Store<AppState>) {
    }

    ngOnInit() {
        this.connectionDetails = this.connectionDetails || {};
    }

    canSave() {
        return this.connectionDetails && this.connectionDetails.serverUrl && this.connectionDetails.serverUrl.length > 0
            && this.connectionDetails.username && this.connectionDetails.username.length > 0
            && this.connectionDetails.password && this.connectionDetails.password.length > 0;
    }
    // onSave() {
    //     this.onClose(false);
    //     // this.onClose(true);
    // }
    onClose(shouldReload) {
        this.close.emit(shouldReload);
    }

    testConnection() {
        this.jiraService.testConnection(this.connectionDetails)
            .pipe(catchError(err => {
                this.connectionDetails.verified = false;
                this.connectionDetails.password = null;
                this.persistenceService.setConnectionDetails(this.connectionDetails);
                return of(null)
            }))
            .subscribe((result: any) => {
                if (result) {
                    this.connectionDetails.displayName = result.displayName;
                    this.connectionDetails.verified = true;
                    this.store$.dispatch(new ConnectionDetailsVerifiedAction(this.connectionDetails));
                    this.persistenceService.setConnectionDetails(this.connectionDetails);

                    this.messageService.add({ severity: "success", summary: "Success", detail: "Connection tested successfully", life: 5000, closable: true });
                    this.testSuccessful = true;

                    this.onClose(true);
                }
            });
        // this.messageService.add({ severity: 'error', summary: "Failed", detail: "Connection failed", life: 10000, closable: true });
    }

    onReset() {
        this.persistenceService.resetConnectionDetails();
        this.onClose(true);
    }
}
