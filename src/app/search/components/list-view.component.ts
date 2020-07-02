import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SearchState } from '../+state/search.state';
import { Viewbase } from './view-base';

@Component({
    selector: 'app-search-listview',
    templateUrl: './list-view.component.html'
})
export class SearchListViewComponent extends Viewbase implements OnInit, OnDestroy {
    public currentPageIndex = 1;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public store$: Store<SearchState>) {
        super(store$)
    }
    ngOnInit(): void {
        this.subscribeIssuelist();
    }
    ngOnDestroy(): void {
        this.unsubscribeIssuelist();
    }

    // canNavigate = () => this.issuelist && this.issuelist.trim().length > 0;
    // navigateTo(issue) {
    //     if (this.canNavigate()) {
    //         this.router.navigate(['/browse', issue.trim()]);
    //     }
    // }

    printExtendedValue(value) {
        if (!value) return '';
        if (!isNaN(Date.parse(value))) {
            return new Date(value).toDateString();
        }
        return value;
    }
    onIssuelistLoaded(): void { }
}
