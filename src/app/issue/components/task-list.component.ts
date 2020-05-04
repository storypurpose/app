import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import { flattenNodes, appendExtendedFields } from '../../lib/jira-tree-utils';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { CachingService } from '../../lib/caching.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../+state/app.state';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html'
})
export class TasklistComponent implements OnInit, OnDestroy {
    _issue: any;
    @Input() set issue(value: any) {
        this._issue = value;
        this.loadDetails();
    }
    get issue() { return this._issue; }

    @Input() showIssue: boolean;
    @Output() close = new EventEmitter<any>();

    tasklistFilterVisible = false;
    childIssueType = '';
    childItems: any;
    filteredItems: any;

    hasExtendedFields = false;
    showDetails = false;
    hideExtendedFields = true;

    statusStats: any;
    statusFilter = "all";
    issueTypeStats: any;
    issueTypeFilter = "all";

    combined$: Subscription;
    currentProject$: Subscription;

    constructor(public jiraService: JiraService,
        public cachingService: CachingService,
        public store$: Store<AppState>) {

    }
    ngOnInit(): void {
        this.currentProject$ = this.store$.select(p => p.app.currentProjectUpdated)
            .subscribe(() => this.loadDetails());
    }

    ngOnDestroy(): void {
        // this.combined$ ? this.combined$.unsubscribe() : null;
        this.currentProject$ ? this.currentProject$.unsubscribe() : null;
    }

    loadDetails() {
        if (this.issue && this.issue.project &&
            this.issue.project.subTaskIssueTypes && this.issue.project.subTaskIssueTypes.length > 0) {

            const subTaskIssueTypes = _.join(_.map(this.issue.project.subTaskIssueTypes, (ff) => `'${ff.name}'`), ',');
            const extendedFields = _.spread(_.union)(_.map(this.issue.project.subTaskIssueTypes, 'list'));
            this.hasExtendedFields = (extendedFields && extendedFields.length > 0);

            const codelist = _.map(extendedFields, 'id');

            this.jiraService.executeJql(`issuetype in (${subTaskIssueTypes}) AND parent=${this.issue.key}`, 0, 100, codelist, 'test-cases.json')
                .pipe(filter((data: any) => data && data.issues))
                .subscribe((data: any) => {
                    this.childItems = flattenNodes(data.issues);
                    this.childItems.forEach(u => u.hideExtendedFields = this.hideExtendedFields);
                    appendExtendedFields(this.childItems, extendedFields);

                    this.onFilterChanged();
                    this.populateStatistics();
                });
        }
    }

    private populateStatistics() {
        const statusResultSet = _.mapValues(_.groupBy(_.map(this.childItems, 'status')), (s) => s.length);
        this.statusStats = Object.keys(statusResultSet).map((key) => { return { key, count: statusResultSet[key] }; });
        const issueTypeResultSet = _.mapValues(_.groupBy(_.map(this.childItems, 'issueType')), (s) => s.length);
        this.issueTypeStats = Object.keys(issueTypeResultSet).map((key) => { return { key, count: issueTypeResultSet[key] }; });
    }

    public onFilterChanged() {
        this.filteredItems = _.filter(this.childItems,
            (ci) => (!this.statusFilter || this.statusFilter === "all" || ci.status === this.statusFilter) &&
                (!this.issueTypeFilter || this.issueTypeFilter === "all" || ci.issueType === this.issueTypeFilter))

        this.filteredItems = _.orderBy(this.filteredItems, ['issueType', 'status']);
    }

    showHideExtendedFields() {
        this.hideExtendedFields = !this.hideExtendedFields;
        if (this.childItems) {
            this.childItems.forEach((u) => u.hideExtendedFields = this.hideExtendedFields);
        }
    }

    onClose() {
        this.close.emit(true);
    }
}