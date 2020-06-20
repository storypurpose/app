import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

@Component({
    selector: 'app-searchbox',
    templateUrl: './searchbox.component.html'
})
export class SearchboxComponent implements OnInit, OnDestroy {
    queryParams$: Subscription;
    query = "";
    @Input() searchVisible = false;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public store$: Store<AppState>) {

    }
    ngOnInit(): void {
        this.queryParams$ = this.activatedRoute.queryParams
            .pipe(filter(p => p && p["query"] && p["query"].length > 0), map(p => p["query"]))
            .subscribe(query => this.query = query);
    }

    ngOnDestroy(): void {
        this.queryParams$ ? this.queryParams$.unsubscribe() : null;
    }
    canExecuteQuery = () => this.query && this.query.trim().length > 0;
    executeQuery() {
        if (this.canExecuteQuery()) {
            this.query = this.query.trim();
            const splitted = _.split(this.query, /[ =]+/);

            (splitted && splitted.length === 1)
                ? this.router.navigate(["/browse", this.query])
                : this.router.navigate(["/search/list"], { queryParams: { query: this.query } });
        }
    }

}
