import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import { flattenNodes, appendExtendedFields } from '../../lib/jira-tree-utils';
import * as _ from 'lodash';
import { filter, map } from 'rxjs/operators';
import { PersistenceService } from '../../lib/persistence.service';
import { Subscription, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../+state/app.state';

@Component({
    selector: 'app-sub-items',
    templateUrl: './sub-items.component.html'
})
export class SubItemsComponent implements OnInit, OnDestroy {
    issue: any;
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

    issueSubscription: Subscription;
    projectsSubscription: Subscription;

    constructor(public jiraService: JiraService,
        public persistenceService: PersistenceService,
        public store$: Store<AppState>) {

    }
    ngOnInit(): void {
        const issue$ = this.store$.select(p => p.purpose.selectedItem).pipe(filter(p => p));
        const projects$ = this.store$.select(p => p.app.projects);
        this.issueSubscription = combineLatest(issue$, projects$)
            .subscribe(([issue, projects]) => {
                this.issue = issue;
                this.issue.project = _.find(projects, { key: this.issue.project.key })
                this.loadDetails(this.issue);
            });
    }
    ngOnDestroy(): void {
        this.issueSubscription ? this.issueSubscription.unsubscribe() : null;
        this.projectsSubscription ? this.projectsSubscription.unsubscribe() : null;
    }

    loadDetails(issue) {
        if (issue.project && issue.project.subTaskIssueTypes && issue.project.subTaskIssueTypes.length > 0) {

            const subTaskIssueTypes = _.join(_.map(issue.project.subTaskIssueTypes, (ff) => `'${ff.name}'`), ',');
            const extendedFields = _.spread(_.union)(_.map(issue.project.subTaskIssueTypes, 'list'));
            this.hasExtendedFields = (extendedFields && extendedFields.length > 0);

            const codelist = _.map(extendedFields, 'id');

            this.jiraService.executeJql(`issuetype in (${subTaskIssueTypes}) AND parent=${issue.key}`, codelist, 'test-cases.json')
                .pipe(filter((data: any) => data && data.issues))
                .subscribe((data: any) => {
                    this.childItems = flattenNodes(data.issues);
                    this.childItems.forEach(u => u.hideExtendedFields = true);
                    appendExtendedFields(this.childItems, extendedFields);

                    this.onFilterChanged();
                    const statusResultSet = _.mapValues(_.groupBy(_.map(this.childItems, 'status')), (s) => s.length);
                    this.statusStats = Object.keys(statusResultSet).map((key) => { return { key, count: statusResultSet[key] } });

                    const issueTypeResultSet = _.mapValues(_.groupBy(_.map(this.childItems, 'issueType')), (s) => s.length);
                    this.issueTypeStats = Object.keys(issueTypeResultSet).map((key) => { return { key, count: issueTypeResultSet[key] } });
                });
        }
    }

    public onFilterChanged() {
        this.filteredItems = _.filter(this.childItems,
            (ci) => (!this.statusFilter || this.statusFilter === "all" || ci.status === this.statusFilter) &&
                (!this.issueTypeFilter || this.issueTypeFilter === "all" || ci.issueType === this.issueTypeFilter))

        this.filteredItems = _.orderBy(this.filteredItems, 'issueType');
    }

    showHideExtendedFields() {
        this.hideExtendedFields = !this.hideExtendedFields;
        if (this.childItems) {
            this.childItems.forEach((u) => u.hideExtendedFields = this.hideExtendedFields);
        }
    }
}