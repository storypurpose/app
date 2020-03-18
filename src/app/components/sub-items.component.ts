import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { JiraService } from '../lib/jira.service';
import { flattenNodes, appendExtendedFields } from '../lib/tree-utils';
import * as _ from 'lodash';
import { filter, map } from 'rxjs/operators';
import { PersistenceService } from '../lib/persistence.service';
import { Subscription } from 'rxjs';
import { PurposeState } from '../purpose/+state/purpose.state';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-sub-items',
    templateUrl: './sub-items.component.html'
})
export class SubDetailsComponent implements OnInit, OnDestroy {
    _issue: any;
    @Input()
    set issue(value: any) {
        this._issue = value;
        if (value) {
            this.loadDetails(value);
        }
    }
    get issue(): any {
        return this._issue;
    }

    childIssueType = '';
    testcases: any;
    hasExtendedFields = false;
    showDetails = false;
    hideExtendedFields = false;
    summary: any;

    subscription: Subscription;

    constructor(public jiraService: JiraService,
        public persistenceService: PersistenceService,
        public store$: Store<PurposeState>) {

    }
    ngOnInit(): void {
        this.subscription = this.store$.select(p => p.purpose)
            .pipe(filter(p => p && p.recentmostItem), map(p => p.recentmostItem))
            .subscribe(data => this.issue = data);
    }
    ngOnDestroy(): void {
        this.subscription ? this.subscription.unsubscribe() : null;
    }

    loadDetails(issue) {
        this.childIssueType = 'ST-Technical task';
        if (issue && issue.type === "Test Suite") {
            this.childIssueType = 'ST-Test Case'
        }
        const extendedFields = this.persistenceService.getExtendedFieldByIssueType(this.childIssueType);
        this.hasExtendedFields = (extendedFields && extendedFields.length > 0);

        const codeList = _.map(extendedFields, (ef) => ef.code);
        this.jiraService.executeJql(`issuetype in ('ST-Technical task', 'ST-Test Case') AND parent=${issue.key}`, codeList, 'test-cases.json')
            .pipe(filter((data: any) => data && data.issues))
            .subscribe((data: any) => {
                this.testcases = flattenNodes(data.issues);

                appendExtendedFields(this.testcases, extendedFields);

                this.summary = _.mapValues(_.groupBy(_.map(this.testcases, 'status')), (s) => s.length);
            });

    }
}