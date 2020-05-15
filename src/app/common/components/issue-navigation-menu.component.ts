import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { IssueState } from 'src/app/issue/+state/issue.state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-issue-navigation-menu',
    templateUrl: './issue-navigation-menu.component.html'
})
export class IssueNavigationMenuComponent implements OnInit, OnDestroy {
    @Input() parentIssueKey: string;
    @Input() issueKey: string;
    @Input() icon: string;
    @Input() placement: string;

    connectionDetails$: Subscription;
    connectionDetails: any;
    constructor(public store$: Store<IssueState>) {
    }
    ngOnInit(): void {
        this.connectionDetails$ = this.store$.select(p => p.app.connectionDetails).pipe(filter(p => p))
            .subscribe(cd => this.connectionDetails = cd);
    }
    ngOnDestroy(): void {
        this.connectionDetails$ ? this.connectionDetails$.unsubscribe() : null;
    }
    prepareExternalUrl(issueKey) {
        return (this.connectionDetails && this.connectionDetails.serverUrl && this.connectionDetails.serverUrl.length > 0)
            ? `${this.connectionDetails.serverUrl}/browse/${issueKey}`
            : '';
    }
}
