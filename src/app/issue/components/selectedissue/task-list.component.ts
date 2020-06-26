import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { LoadSubtasksAction } from '../../+state/issue.actions';
import { IssueState } from '../../+state/issue.state';

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
    filteredItems: any;

    hasExtendedFields = false;
    hideDetails = true;
    hideExtendedFields = true;

    statusStats: any;
    statusFilter = "all";
    issueTypeStats: any;
    issueTypeFilter = "all";

    subtasks$: Subscription;
    subtasks: any;
    loading = false;
    constructor(public store$: Store<IssueState>) {
    }

    ngOnInit(): void {
        this.subtasks$ = this.store$.select(p => p.issue.subtasks)
            .pipe(filter(p => p))
            .subscribe(subtasks => {
                this.subtasks = subtasks;
                this.subtasks.forEach(u => u.hideExtendedFields = this.hideExtendedFields);

                this.onFilterChanged();
                this.populateStatistics();
                this.loading = false;
            })
    }

    ngOnDestroy(): void {
        this.subtasks$ ? this.subtasks$.unsubscribe() : null;
    }

    loadDetails() {
        this.subtasks = null;
        if (this.issue && this.issue.projectConfig &&
            this.issue.projectConfig.subTaskIssueTypes && this.issue.projectConfig.subTaskIssueTypes.length > 0) {

            const subTaskIssueTypes = _.join(_.map(this.issue.projectConfig.subTaskIssueTypes, (ff) => `'${ff.name}'`), ',');
            const extendedFields = _.spread(_.union)(_.map(this.issue.projectConfig.subTaskIssueTypes, 'list'));
            this.hasExtendedFields = (extendedFields && extendedFields.length > 0);

            this.loading = true;
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

    issueDetailsVisible = false;
    issueDetails: any;
    currentIndex: 0;
    openIssueAtIndex(index) {
        this.issueDetailsVisible = true;
        this.currentIndex = index;
    }
}
