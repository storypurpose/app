import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'app-searchbox',
    templateUrl: './searchbox.component.html'
})
export class SearchboxComponent implements OnInit, OnDestroy {
    query$: Subscription;
    query = "";
    @Input() searchVisible = false;

    constructor(public router: Router,
        public store$: Store<AppState>) {

    }
    ngOnInit(): void {
        this.query$ = this.store$.select(p => p.app.query).pipe(filter(p => p && p.length > 0))
            .subscribe(query => this.query = query);
    }
    ngOnDestroy(): void {
        this.query$ ? this.query$.unsubscribe() : null;
    }
    canExecuteQuery = () => this.query && this.query.trim().length > 0;
    executeQuery() {
        if (this.canExecuteQuery()) {
            this.router.navigate(["/search/list"], { queryParams: { query: this.query } });
        }
    }

}
