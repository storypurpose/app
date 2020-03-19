import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../+state/app.state';

@Component({
    selector: 'app-extended-fields',
    templateUrl: './extended-fields.component.html'
})
export class ExtendedFieldsComponent implements OnInit, OnDestroy {
    public issue: any;
    subscription: Subscription;

    constructor(public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.subscription = this.store$.select(p => p.purpose)
            .pipe(filter(p => p && p.recentmostItem), map(p => p.recentmostItem))
            .subscribe(data => this.issue = data);
    }
    ngOnDestroy(): void {
        this.subscription ? this.subscription.unsubscribe() : null;
    }
}
