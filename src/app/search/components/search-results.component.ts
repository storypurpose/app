import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JiraService } from '../../lib/jira.service';
import { SetIssuelistAction, ShowQueryExecutorVisibleAction } from '../+state/search.actions';
import { populateFieldValuesCompact, CustomNodeTypes } from '../../lib/jira-tree-utils';
import { SearchState } from '../+state/search.state';
import { AppState } from 'src/app/+state/app.state';
import { SetSearchQueryAction } from 'src/app/+state/app.actions';

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html'
})
export class SearchResultsComponent implements OnInit, OnDestroy {

    query: string;
    issuelist: any;
    issuelist$: Subscription;
    queryParams$: Subscription;
    query$: Subscription;

    public currentPageIndex = 1;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public jiraService: JiraService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        // this.store$.dispatch(new SetSearchQueryAction(""));

        // this.query$ = this.store$.select(p => p.app.query)
        //     .pipe(filter(p => p && p.length > 0))
        //     .subscribe(query => {
        //         this.query = query;
        //         this.executeQuery();
        //     });
        // this.queryParams$ = this.activatedRoute.queryParams
        //     .pipe(filter(p => p && p["query"] && p["query"].length > 0), map(p => p["query"]))
        //     .subscribe(query => this.store$.dispatch(new SetSearchQueryAction(query)));

        this.issuelist$ = this.store$.select(p => p.search.issuelist).pipe(filter(p => p))
            .subscribe(key => this.issuelist = key);
    }
    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe : null;
        // this.query$ ? this.query$.unsubscribe : null;
        // this.queryParams$ ? this.queryParams$.unsubscribe : null;
    }

    canNavigate = () => this.issuelist && this.issuelist.trim().length > 0;
    navigateTo(issue) {
        if (this.canNavigate()) {
            this.router.navigate(['/browse', issue.trim()]);
        }
    }

    // canExecuteQuery = () => this.query && this.query.trim().length > 0;
    // executeQuery() {
    //     if (this.canExecuteQuery()) {
    //         this.jiraService.executeJql(this.query, this.currentPageIndex - 1, 50, ['components', 'labels', 'fixVersions'], 'issuelist.json')
    //             .pipe(map((p: any) => {
    //                 return {
    //                     total: p.total,
    //                     startAt: p.startAt,
    //                     endAt: ((p.startAt + p.maxResults) < p.total) ? p.startAt + p.maxResults : p.total,
    //                     pageSize: p.maxResults,
    //                     results: _.map(p.issues, p => populateFieldValuesCompact(p))
    //                 }
    //             }))
    //             .subscribe(result => this.store$.dispatch(new SetIssuelistAction(result)));
    //     }
    // }
    // onPageChange() {
    //     this.executeQuery();
    // }

    // plotStoryboard() {
    //     this.store$.dispatch(new ShowQueryExecutorVisibleAction(false));
    //     this.router.navigate(['/browse/storyboard/forfilter'], { queryParams: { query: this.query } });
    // }
}
