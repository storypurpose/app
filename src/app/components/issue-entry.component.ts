import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-issue-entry',
    templateUrl: './issue-entry.component.html'
})
export class IssueEntryComponent implements OnInit, OnDestroy {
    issue: string;
    subscription: Subscription;
    constructor(public router: Router, public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        // this.subscription = this.store$.select(p => p.app)
        //     .pipe(filter(p => p && p.currentIssueKey && p.currentIssueKey.length > 0), map(p => p.currentIssueKey))
        //     .subscribe(key => this.issue = key);
    }
    ngOnDestroy(): void {
        this.subscription ? this.subscription.unsubscribe : null;
    }

    canNavigate = () => this.issue && this.issue.trim().length > 0

    navigateTo(issue) {
        if (this.canNavigate()) {
            this.router.navigate(['/for', issue.trim()]);
        }
    }
}
