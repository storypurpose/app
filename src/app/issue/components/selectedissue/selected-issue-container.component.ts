import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as _ from "lodash";
import { Subscription, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, searchTreeByKey } from 'src/app/lib/jira-tree-utils';
import {
    UpdateOrganizationPurposeAction, SetSelectedIssueAction,
    LoadSelectedIssueAction, LoadSelectedIssueEpicChildrenAction, LoadSelectedIssueRelatedLinksAction
} from '../../+state/issue.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueState } from '../../+state/issue.state';

@Component({
    selector: 'app-selected-issue-container',
    templateUrl: './selected-issue-container.component.html'
})
export class SelectedIssueContainerComponent implements AfterViewInit, OnInit, OnDestroy {
    combined$: Subscription;

    updatedField$: Subscription;
    extendedFields: any;

    selectedIssue$: Subscription;
    selectedIssue: any;

    organization$: Subscription;

    primaryIssue: any;

    localNodeType: any;
    constructor(public cdRef: ChangeDetectorRef,
        public router: Router,
        public activatedRoute: ActivatedRoute,
        public store$: Store<IssueState>
    ) {
    }
    ngOnInit(): void {
        this.localNodeType = CustomNodeTypes;

        this.updatedField$ = this.store$.select(p => p.issue.updatedField).pipe(filter(p => p && this.selectedIssue))
            .subscribe(p => {
                this.store$.dispatch(
                    new LoadSelectedIssueAction({ issue: this.selectedIssue.key, extendedFields: this.extendedFields }));
            });

        this.organization$ = this.store$.select(p => p.app.organization).pipe(filter(p => p))
            .subscribe(org => this.store$.dispatch(new UpdateOrganizationPurposeAction(org)));

        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue).pipe(filter(p => p))
            .subscribe(selectedIssue => {
                this.selectedIssue = selectedIssue;
                if (!this.selectedIssue.relatedLinksLoaded && !this.selectedIssue.relatedLinksLoading) {
                    if (this.selectedIssue.relatedLinks && this.selectedIssue.relatedLinks.length > 0) {
                        this.store$.dispatch(new LoadSelectedIssueRelatedLinksAction(_.map(this.selectedIssue.relatedLinks, 'key')));
                    }
                }
                if (this.selectedIssue.issueType === CustomNodeTypes.Epic &&
                    !this.selectedIssue.epicChildrenLoaded && !this.selectedIssue.epicChildrenLoading) {
                    this.store$.dispatch(new LoadSelectedIssueEpicChildrenAction(this.selectedIssue.key));
                }
            });

        const primaryIssueQuery$ = this.store$.select(p => p.issue.primaryIssue).pipe(filter(p => p));
        const hierarchicalIssueQuery$ = this.store$.select(p => p.issue.hierarchicalIssue).pipe(filter(issue => issue));
        const paramsQuery$ = this.activatedRoute.params
            .pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]));

        this.combined$ = combineLatest(primaryIssueQuery$, hierarchicalIssueQuery$, paramsQuery$)
            .subscribe(([primaryIssue, hierarchicalIssue, selectedIssueKey]) => {
                this.primaryIssue = primaryIssue;

                if (selectedIssueKey.toLowerCase() === this.primaryIssue.key.toLowerCase()) {
                    this.store$.dispatch(new SetSelectedIssueAction(primaryIssue));
                } else {
                    if (!this.selectedIssue || this.selectedIssue.key.toLowerCase() !== selectedIssueKey.toLowerCase()) {
                        const hierarchicalNode = searchTreeByKey(hierarchicalIssue, selectedIssueKey);
                        this.extendedFields = hierarchicalNode
                            ? this.populateExtendedFields(primaryIssue.projectConfig, hierarchicalNode.issueType)
                            : [];

                        this.store$.dispatch(new LoadSelectedIssueAction({ issue: selectedIssueKey, extendedFields: this.extendedFields }));
                    }
                }
            })
    }

    private populateExtendedFields(projectConfig, issueType: any) {
        if (projectConfig && projectConfig.standardIssueTypes) {
            const issueTypeConfig = _.find(projectConfig.standardIssueTypes, { name: issueType });
            return (issueTypeConfig) ? issueTypeConfig.list : [];
        }
        return [];
    }

    ngOnDestroy(): void {
        this.updatedField$ ? this.updatedField$.unsubscribe() : null;
        this.organization$ ? this.organization$.unsubscribe() : null;
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.selectedIssue$ ? this.selectedIssue$.unsubscribe() : null;
    }

    canNavigateToStoryboard = () =>
        this.selectedIssue && this.primaryIssue &&
        (this.selectedIssue.issueType === 'Epic' || this.primaryIssue.key.toLowerCase() === this.selectedIssue.key.toLowerCase());

    onShowIssuelist() {
        this.router.navigate(['/search/list']);
    }

    showIssueEntry = false;
    onShowIssueEntry() {
        this.showIssueEntry = true;
    }
    onCancelIssueEntry() {
        this.showIssueEntry = false;
    }

    contentHeight = 0;
    @ViewChild('content') elementView: ElementRef;
    ngAfterViewInit(): void {
        this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - 118;
        this.cdRef.detectChanges();
    }

}