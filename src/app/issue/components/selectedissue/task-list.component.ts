import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { JiraService } from '../../../lib/jira.service';
import { flattenNodes, appendExtendedFields } from '../../../lib/jira-tree-utils';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { CachingService } from '../../../lib/caching.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../+state/app.state';
import { LoadSubtasksAction } from '../../+state/issue.actions';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html'
})
export class TasklistComponent implements OnInit, OnDestroy {
    @Input() projectConfig: any;

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
    filteredItems: any;

    hasExtendedFields = false;
    showDetails = false;
    hideExtendedFields = true;

    statusStats: any;
    statusFilter = "all";
    issueTypeStats: any;
    issueTypeFilter = "all";

    subtasks$: Subscription;
    subtasks: any;
    currentProject$: Subscription;

    constructor(public store$: Store<AppState>) {
    }

    ngOnInit(): void {
        this.subtasks$ = this.store$.select(p => p.issue.subtasks)
            .pipe(filter(p => p))
            .subscribe(subtasks => {
                this.subtasks = subtasks;
                this.subtasks.forEach(u => u.hideExtendedFields = this.hideExtendedFields);

                this.onFilterChanged();
                this.populateStatistics();

            })
        this.currentProject$ = this.store$.select(p => p.app.currentProjectUpdated)
            .subscribe(() => this.loadDetails());
    }

    ngOnDestroy(): void {
        this.subtasks$ ? this.subtasks$.unsubscribe() : null;
        this.currentProject$ ? this.currentProject$.unsubscribe() : null;
    }

    loadDetails() {
        this.subtasks = null;
        if (this.issue && this.projectConfig && this.projectConfig.subTaskIssueTypes && this.projectConfig.subTaskIssueTypes.length > 0) {

            const subTaskIssueTypes = _.join(_.map(this.projectConfig.subTaskIssueTypes, (ff) => `'${ff.name}'`), ',');
            const extendedFields = _.spread(_.union)(_.map(this.projectConfig.subTaskIssueTypes, 'list'));
            this.hasExtendedFields = (extendedFields && extendedFields.length > 0);

            this.store$.dispatch(new LoadSubtasksAction({ issueKey: this.issue.key, subTaskIssueTypes, extendedFields }));
        }
    }

    private populateStatistics() {
        const statusResultSet = _.mapValues(_.groupBy(_.map(this.subtasks, 'status')), (s) => s.length);
        this.statusStats = Object.keys(statusResultSet).map((key) => { return { key, count: statusResultSet[key] }; });
        const issueTypeResultSet = _.mapValues(_.groupBy(_.map(this.subtasks, 'issueType')), (s) => s.length);
        this.issueTypeStats = Object.keys(issueTypeResultSet).map((key) => { return { key, count: issueTypeResultSet[key] }; });
    }

    public onFilterChanged() {
        this.filteredItems = _.filter(this.subtasks,
            (ci) => (!this.statusFilter || this.statusFilter === "all" || ci.status === this.statusFilter) &&
                (!this.issueTypeFilter || this.issueTypeFilter === "all" || ci.issueType === this.issueTypeFilter))

        this.filteredItems = _.orderBy(this.filteredItems, ['issueType', 'status']);
    }

    showHideExtendedFields() {
        this.hideExtendedFields = !this.hideExtendedFields;
        if (this.subtasks) {
            this.subtasks.forEach((u) => u.hideExtendedFields = this.hideExtendedFields);
        }
    }

    onClose() {
        this.close.emit(true);
    }
}