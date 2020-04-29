import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { AppState } from '../../+state/app.state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, tap, map } from 'rxjs/operators';
import { JiraService } from '../../lib/jira.service';
import { SetIssuelistAction } from '../../+state/app.actions';
import { populateFieldValuesCompact, CustomNodeTypes, populateFieldValues } from '../../lib/jira-tree-utils';

@Component({
    selector: 'app-query-executor',
    templateUrl: './query-executor.component.html'
})
export class IssuelistComponent implements OnInit, OnDestroy {
    @Output() close = new EventEmitter<any>();

    @Input() set selectedItem(value: any) {
        let parsedList = [];
        this.parseSelectedItem(value, parsedList);
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
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.issuelist$ = this.store$.select(p => p.app.issuelist).pipe(filter(p => p))
            .subscribe(key => this.issuelist = key);

        this.executeQuery();
    }
    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe : null;
    }

    parseSelectedItem(value: any, parsedList) {
        if (!value) return;

        if (value.issueType !== CustomNodeTypes.Organization) {
            parsedList.push({ key: value.issueType, value: value.key });
        }
        return value.parent ? this.parseSelectedItem(value.parent, parsedList) : null;
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
                .subscribe(p => this.store$.dispatch(new SetIssuelistAction(p)));
        }
    }
    onPageChange(index) {
        this.executeQuery();
    }
    onClose() {
        this.close.emit(null);
    }

    plotStoryboard() {
        this.router.navigate(['/browse/storyboard/forfilter'], { queryParams: { query: this.query } });
    }
}
