import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SearchState } from '../+state/search.state';

@Component({
    selector: 'app-search-listview',
    templateUrl: './list-view.component.html'
})
export class SearchListViewComponent implements OnInit, OnDestroy {

    query: string;
    issuelist: any;
    issuelist$: Subscription;
    queryParams$: Subscription;
    query$: Subscription;

    public currentPageIndex = 1;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public store$: Store<SearchState>) {
    }
    ngOnInit(): void {
        this.issuelist$ = this.store$.select(p => p.search.issuelist)
            .pipe(filter(p => p))
            .subscribe(key => this.issuelist = key);
    }
    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe : null;
    }

    canNavigate = () => this.issuelist && this.issuelist.trim().length > 0;
    navigateTo(issue) {
        if (this.canNavigate()) {
            this.router.navigate(['/browse', issue.trim()]);
        }
    }

    printExtendedValue(value) {
        console.log(Date.parse(value));
        if (!value) return '';
        if (!isNaN(Date.parse(value))) {
            return new Date(value).toDateString();
        }
        return value;
    }
}
