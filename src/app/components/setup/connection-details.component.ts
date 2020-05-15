import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthenticationModeTypes } from '../../lib/jira.service';
import * as _ from 'lodash';
import { MessageService } from 'primeng/api';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { VerifyConnectionDetailsAction } from 'src/app/+state/app.actions';
import { filter } from 'rxjs/operators';

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

    constructor(public store$: Store<AppState>, public messageService: MessageService) {
    }

    ngOnInit() {
        this.connectionDetails = this.connectionDetails || {};
        this.store$.select(p => p.app.connectionDetails).pipe(filter(p => p))
            .subscribe(connectionDetails => {
                if (connectionDetails.verified) {
                    this.messageService.clear();
                    this.messageService.add({ severity: "success", summary: "Success", detail: "Connection tested successfully", life: 5000, closable: true });
                    this.testSuccessful = true;
                    this.onClose(true);
                } else if (connectionDetails.verified === false && connectionDetails.username) {
                    this.messageService.add({ severity: 'error', summary: "Failed", detail: "Connection failed", life: 5000, closable: true });
                }
            })
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
        console.log(this.connectionDetails);
        this.store$.dispatch(new VerifyConnectionDetailsAction(this.connectionDetails));
    }
}
