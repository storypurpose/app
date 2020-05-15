import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { MessageService } from 'primeng/api';
import { AppState } from '../../+state/app.state';
import { Store } from '@ngrx/store';
import { ShowConnectionEditorAction, ModeTypes } from '../../+state/app.actions';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-issue-home',
    templateUrl: './home.component.html'
})
export class IssueHomeComponent implements OnInit, OnDestroy {
    public connectionDetails: any;
    isOnlineMode = false;
    connectionDetailsSubscription: Subscription;

    constructor(public messageService: MessageService,
        public store$: Store<AppState>) {
    }

    ngOnInit() {
        this.store$.select(mode => mode.app.mode)
            .subscribe(mode => this.isOnlineMode = mode && mode === ModeTypes.Online);

        this.connectionDetailsSubscription = this.store$.select(p => p.app.connectionDetails)
            .subscribe(p => this.connectionDetails = p);
    }
    ngOnDestroy(): void {
        this.connectionDetailsSubscription ? this.connectionDetailsSubscription.unsubscribe() : null;
    }

    onShowSetup() {
        this.store$.dispatch(new ShowConnectionEditorAction(true));
    }
}
