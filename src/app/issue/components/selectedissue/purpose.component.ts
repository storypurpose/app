import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IssueState } from '../../+state/issue.state';
import { Store } from '@ngrx/store';
import { searchTreeByKey, copyFieldValues, CustomNodeTypes } from 'src/app/lib/jira-tree-utils';
import { SetPurposeAction } from '../../+state/issue.actions';

@Component({
    selector: 'app-purpose',
    templateUrl: './purpose.component.html'
})
export class PurposeDetailsComponent implements OnInit, OnDestroy {
    @Output() edit = new EventEmitter<any>();

    public showAll = false;
    hideExtendedFields = false;

    purpose$: Subscription;
    combined$: Subscription;
    public purpose: any;

    public hierarchicalNode: any;
    public selectedIssueKey: string;

    constructor(public store$: Store<IssueState>) { }

    ngOnInit(): void {

        this.purpose$ = this.store$.select(p => p.issue.purpose)
            .subscribe(p => this.purpose = p);

        const selectedIssueQuery$ = this.store$.select(p => p.issue.selectedIssue).pipe(filter(p => p));
        const hierarchicalIssueQuery$ = this.store$.select(p => p.issue.hierarchicalIssue).pipe(filter(issue => issue));
        this.combined$ = combineLatest(selectedIssueQuery$, hierarchicalIssueQuery$)
            .subscribe(([selectedIssue, hierarchicalIssue]) => {
                this.selectedIssueKey = selectedIssue.key;
                this.hierarchicalNode = hierarchicalIssue;
                setTimeout(() => {
                    const selectedNode = searchTreeByKey(hierarchicalIssue, selectedIssue.key);
                    if (selectedNode) {
                        copyFieldValues(selectedIssue, selectedNode);
                        this.store$.dispatch(new SetPurposeAction(this.expandPurpose(selectedNode)));
                    }
                }, 200);
            });
    }

    ngOnDestroy(): void {
        this.purpose$ ? this.purpose$.unsubscribe() : null;
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

    //#region toggle fullscreen
    defaultLeftPaneSize = 35;
    leftPaneSize = this.defaultLeftPaneSize;
    public columns: any = [{ visible: true, size: this.defaultLeftPaneSize }, { visible: true, size: (100 - this.defaultLeftPaneSize) }];
    dragEnd(e: { gutterNum: number; sizes: Array<number> }) {
        this.adjustPaneSize(e.sizes[0]);
    }
    public adjustPaneSize(sizeOfLeftPane) {
        this.leftPaneSize = sizeOfLeftPane;
        this.columns[0].size = sizeOfLeftPane;
        this.columns[1].size = 100 - sizeOfLeftPane;
    }
    toggleFullscreen() {
        this.adjustPaneSize(this.leftPaneSize === 0 ? this.defaultLeftPaneSize : 0);
    }
    //#endregion

}
