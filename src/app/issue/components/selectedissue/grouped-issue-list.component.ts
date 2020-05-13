import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { IssueState } from '../../+state/issue.state';

@Component({
    selector: 'app-grouped-issue-list',
    templateUrl: './grouped-issue-list.component.html'
})
export class GroupedIssuelistComponent implements OnInit, OnDestroy {
    @Input() issues: any;
    @Input() projectConfig: any;
    @Input() groupBy: any;

    selectedIssue: any;
    groupedIssues: any;

    constructor(public store$: Store<IssueState>) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }

    selectIssue(issue) {
        this.selectedIssue = issue;        
    }
    resetSelectedIssue = () => this.selectedIssue = null;
}