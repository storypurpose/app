import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IssueState } from '../../+state/issue.state';
import { Store } from '@ngrx/store';
import { searchTreeByKey, copyFieldValues, CustomNodeTypes } from 'src/app/lib/jira-tree-utils';

@Component({
    selector: 'app-purpose',
    templateUrl: './purpose.component.html'
})
export class PurposeDetailsComponent implements OnInit, OnDestroy {
    @Output() edit = new EventEmitter<any>();

    public showAll = false;
    hideExtendedFields = false;

    combined$: Subscription;
    public purpose: any;

    public hierarchySetupVisibility$: Subscription;
    public hierarchicalNode: any;
    public selectedIssueKey: string;

    constructor(public store$: Store<IssueState>) { }

    ngOnInit(): void {

        const selectedIssueQuery$ = this.store$.select(p => p.issue.selectedIssue).pipe(filter(p => p));
        const hierarchicalIssueQuery$ = this.store$.select(p => p.issue.hierarchicalIssue).pipe(filter(issue => issue));

        this.combined$ = combineLatest(selectedIssueQuery$, hierarchicalIssueQuery$)
            .subscribe(([selectedIssue, hierarchicalIssue]) => {
                this.selectedIssueKey = selectedIssue.key;
                this.hierarchicalNode = hierarchicalIssue;
                const selectedNode = searchTreeByKey(hierarchicalIssue, selectedIssue.key);
                if (selectedNode) {
                    copyFieldValues(selectedIssue, selectedNode);
                    this.purpose = this.expandPurpose(selectedNode);
                }
            });
    }

    ngOnDestroy(): void {
        this.hierarchySetupVisibility$ ? this.hierarchySetupVisibility$.unsubscribe() : null;
        this.combined$ ? this.combined$.unsubscribe() : null;
    }

    showHideAllPurposes(value) {
        this.showAll = value;
        if (this.purpose) {
            this.purpose.forEach(u => u.show = this.showAll)
            if (!this.showAll && this.purpose.length > 0) {
                this.purpose[this.purpose.length - 1].show = true;
            }
        }
    }

    public expandPurpose(node: any) {
        const purpose = [];
        this.populatePurpose(node, purpose);
        _.reverse(purpose);
        if (purpose.length > 0) {
            purpose[purpose.length - 1].show = true;
        }
        return purpose;
    }

    public populatePurpose(node, purpose) {
        if (node) {
            if (node.issueType !== CustomNodeTypes.EpicChildren && node.issueType !== CustomNodeTypes.RelatedLink) {
                purpose.push({
                    key: node.key, issueType: node.issueType, title: node.title, purpose: node.description,
                    editable: node.editable, hfKey: node.hfKey, show: false
                });
            }
            if (node.parent) {
                this.populatePurpose(node.parent, purpose);
            }
        }
    }
}
