import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, combineLatest } from 'rxjs';
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
    allExtendedFields: any;

    issuelist: any;
    issuelist$: Subscription;

    emptyQueryParams$: Subscription;
    combined$: Subscription;

    public currentPageIndex = 1;
    showSavedSearches = false;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public store$: Store<SearchState>) {
    }

    ngOnInit(): void {
        this.store$.dispatch(new ToggleQueryEditorVisibilityAction(true));

        const queryContextQ = this.store$.select(p => p.search.queryContext)
            .pipe(filter(p => p && p.query && p.query.length > 0), map(p => p.query));
        const emptyQueryParamQ = this.activatedRoute.queryParams.pipe(filter(p => !p || !p["query"]));
        this.emptyQueryParams$ = combineLatest(queryContextQ, emptyQueryParamQ) //redirect from storypurpose view
            .subscribe(([query]) => {
                this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { query } })
            }
            );

        const queryParamsQ = this.activatedRoute.queryParams
            .pipe(filter(p => p && p["query"] && p["query"].length > 0), map(p => p["query"]));
        const allExtendedFieldsQ = this.store$.select(p => p.app.allExtendedFields);
        this.combined$ = combineLatest(queryParamsQ, allExtendedFieldsQ)
            .subscribe(([query, allExtendedFields]) => {
                this.query = query;
                this.allExtendedFields = allExtendedFields;
                this.executeQuery();
            });

        this.issuelist$ = this.store$.select(p => p.search.issuelist)
            .subscribe(key => this.issuelist = key);
    }
    ngOnDestroy(): void {
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.issuelist$ ? this.issuelist$.unsubscribe : null;
        this.emptyQueryParams$ ? this.emptyQueryParams$.unsubscribe() : null;
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
            this.store$.dispatch(new LoadSearchResultsAction({
                query: this.query,
                allExtendedFields: this.allExtendedFields,
                currentPageIndex: this.currentPageIndex
            }));
        }
    }

    onPageChange() {
        this.executeQuery();
    }

}
