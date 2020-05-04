import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IssueState } from '../+state/issue.state';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-recently-viewed',
    templateUrl: './recently-viewed.component.html'
})
export class RecentlyViewedComponent implements OnInit, OnDestroy {
    public issues = [];
    public currentIssue: any;

    subscription: Subscription;

    constructor(public store$: Store<IssueState>) {

    }
    ngOnInit(): void {
        this.subscription = this.store$.select(p => p.issue)
            .pipe(filter(p => p && p.recentmostItem), map(p => p.recentmostItem))
            .subscribe(data => this.setIssue(data));
    }
    ngOnDestroy(): void {
        this.subscription ? this.subscription.unsubscribe() : null;
    }
    forgetIssue(index) {
        this.issues.splice(index, 1);
    }
    setIssue(value: any) {
        this.currentIssue = value;
        if (value && value.key) {
             _.remove(this.issues, { "key": value.key });
            if (this.issues.length >= 5) {
                this.issues.splice(5, 1);
            }
            _.forEach(this.issues, (i) => i.active = false);
            const recentMost = { key: value.key, title: value.label, active: true };
            this.issues.unshift(recentMost);
        }
    }
}
