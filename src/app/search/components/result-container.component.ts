import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LoadSearchResultsAction } from '../+state/search.actions';
import { CustomNodeTypes } from '../../lib/jira-tree-utils';
import { ToggleQueryEditorVisibilityAction } from 'src/app/+state/app.actions';
import { SearchState } from '../+state/search.state';

@Component({
    selector: 'app-result-container',
    templateUrl: './result-container.component.html'
})
export class SearchResultContainerComponent implements OnInit, OnDestroy {
    selectedTab = 1;

    query: string;
    issuelist: any;
    issuelist$: Subscription;
    query$: Subscription;
    queryParams$: Subscription;

    public currentPageIndex = 1;
    showSavedSearches = false;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public store$: Store<SearchState>) {
    }

    ngOnInit(): void {
        this.store$.dispatch(new ToggleQueryEditorVisibilityAction(true));

        this.queryParams$ = this.activatedRoute.queryParams
            .pipe(filter(p => p && p["query"] && p["query"].length > 0), map(p => p["query"]))
            .subscribe(query => {
                this.query = query;
                this.executeQuery();
            });

        this.issuelist$ = this.store$.select(p => p.search.issuelist).pipe(filter(p => p))
            .subscribe(key => this.issuelist = key);
    }
    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe : null;
        this.query$ ? this.query$.unsubscribe : null;
        this.queryParams$ ? this.queryParams$.unsubscribe : null;
    }

    parseQueryContext(value: any, parsedList) {
        if (!value) return;

        if (value.issueType !== CustomNodeTypes.Organization) {
            parsedList.push({ key: value.issueType, value: value.key });
        }
        return value.parent ? this.parseQueryContext(value.parent, parsedList) : null;
    }

    canNavigate = () => this.issuelist && this.issuelist.trim().length > 0;
    navigateTo(issue) {
        if (this.canNavigate()) {
            this.router.navigate(['/browse', issue.trim()]);
        }
    }

    canExecuteQuery = () => this.query && this.query.trim().length > 0;
    executeQuery() {
        if (this.canExecuteQuery()) {
            this.showSavedSearches = false;
            this.store$.dispatch(new LoadSearchResultsAction({ query: this.query, currentPageIndex: this.currentPageIndex }));
        }
    }

    onPageChange() {
        this.executeQuery();
    }

}
