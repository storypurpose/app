import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { MessageService } from 'primeng/api';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { ShowConnectionEditorAction, ModeTypes } from '../+state/app.actions';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-setup',
    templateUrl: './setup.component.html'
})
export class SetupComponent implements OnInit, OnDestroy {
    isOnlineMode = false;
    connectionDetails$: Subscription;
    connectionDetails: any;

    constructor(public router: Router, public store$: Store<AppState>) {
    }

    ngOnInit() {
        this.store$.select(mode => mode.app.mode)
            .subscribe(mode => this.isOnlineMode = mode && mode === ModeTypes.Online);

        this.connectionDetails$ = this.store$.select(p => p.app.connectionDetails)
            .subscribe(p => {
                this.connectionDetails = p;
                if (this.connectionDetails && this.connectionDetails.verified) {
                    this.router.navigate(["/browse"]);
                }
            });
    }
    ngOnDestroy(): void {
        this.connectionDetails$ ? this.connectionDetails$.unsubscribe() : null;
    }

    onShowSetup() {
        this.store$.dispatch(new ShowConnectionEditorAction(true));
    }
}
