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

@Component({
    selector: 'app-query-executor',
    templateUrl: './query-executor.component.html'
})
export class QueryExecutorComponent implements OnInit, OnDestroy {
    @Output() close = new EventEmitter<any>();

    @Input() set queryContext(value: any) {
        let parsedList = [];
        this.parseQueryContext(value, parsedList);
        parsedList = _.reverse(parsedList);
        this.query = (parsedList.length > 0)
            ? _.join(_.map(parsedList, pl => `'${pl.key}' = '${pl.value}'`), ' AND ') + ' ORDER BY ' +
            _.join(_.map(parsedList, pl => `'${pl.key}'`), ',') + ', issuetype'
            : "issuetype = epic ";
        this.executeQuery();
    }


    query: string = "issuetype = epic";
    issuelist: any;
    issuelist$: Subscription;

    public currentPageIndex = 1;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public jiraService: JiraService,
        public store$: Store<SearchState>) {
    }
    ngOnInit(): void {
        this.issuelist$ = this.store$.select(p => p.search.issuelist).pipe(filter(p => p))
            .subscribe(key => this.issuelist = key);

        this.executeQuery();
    }
    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe : null;
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
            this.jiraService.executeJql(this.query, this.currentPageIndex - 1, 50, ['components', 'labels', 'fixVersions'], 'issuelist.json')
                .pipe(map((p: any) => {
                    return {
                        total: p.total,
                        startAt: p.startAt,
                        endAt: ((p.startAt + p.maxResults) < p.total) ? p.startAt + p.maxResults : p.total,
                        pageSize: p.maxResults,
                        results: _.map(p.issues, p => populateFieldValuesCompact(p))
                    }
                }))
                .subscribe(result => this.store$.dispatch(new SetIssuelistAction({ query: this.query, result: result })));
        }
    }
    onPageChange() {
        this.executeQuery();
    }
    onClose() {
        this.close.emit(null);
    }

    plotStoryboard() {
        this.store$.dispatch(new ShowQueryExecutorVisibleAction(false));
        this.router.navigate(['/browse/storyboard/forfilter'], { queryParams: { query: this.query } });
    }
}
