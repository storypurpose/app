import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../+state/app.state';

@Component({
    selector: 'app-extended-fields',
    templateUrl: './extended-fields.component.html'
})
export class ExtendedFieldsComponent implements OnInit, OnDestroy {
    public issue: any;
    issue$: Subscription;
    public fontSizeSmall = false;

    constructor(public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.issue$ = this.store$.select(p => p.purpose.selectedItem).pipe(filter(p => p))
            .subscribe(p => this.issue = p);
    }
    ngOnDestroy(): void {
        this.issue$ ? this.issue$.unsubscribe() : null;
    }
}
