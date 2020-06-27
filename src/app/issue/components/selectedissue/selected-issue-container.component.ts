import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import * as _ from "lodash";
import { Subscription, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, searchTreeByKey } from 'src/app/lib/jira-tree-utils';
import {
    UpdateOrganizationPurposeAction, SetSelectedIssueAction,
    LoadSelectedIssueAction, LoadSelectedIssueEpicChildrenAction, LoadSelectedIssueRelatedLinksAction, ChangeSelectedIssueViewAction
} from '../../+state/issue.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueState } from '../../+state/issue.state';
import { ResizableContainerBase } from './resizable-container-base';

@Component({
    selector: 'app-selected-issue-container',
    templateUrl: './selected-issue-container.component.html'
})
export class SelectedIssueContainerComponent extends ResizableContainerBase implements AfterViewInit, OnInit, OnDestroy {
    canNavigateToStoryboard = false;
    primaryAndSelectIssueSame = false;

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
        super(cdRef, store$);
    }
    ngOnInit(): void {
        this.init(50);
        this.localNodeType = CustomNodeTypes;

        this.updatedField$ = this.store$.select(p => p.issue.updatedField).pipe(filter(p => p && this.selectedIssue))
            .subscribe(() => {
                this.store$.dispatch(
                    new LoadSelectedIssueAction({ issue: this.selectedIssue.key, extendedFields: this.extendedFields }));
            });

        this.organization$ = this.store$.select(p => p.app.organization).pipe(filter(p => p))
            .subscribe(org => this.store$.dispatch(new UpdateOrganizationPurposeAction(org)));

        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue).pipe(filter(p => p))
            .subscribe(selectedIssue => {
                this.compactView = false;
                this.selectedIssue = selectedIssue;
                this.primaryAndSelectIssueSame = this.checkIsPrimaryAndSelectIssueSame();
                this.canNavigateToStoryboard = this.primaryAndSelectIssueSame && this.selectedIssue.issueType === 'Epic';

                if (!this.primaryIssue || !this.primaryIssue.key ||
                    this.selectedIssue.key.toLowerCase() !== this.primaryIssue.key.toLowerCase()) {
                    if (!this.selectedIssue.relatedLinksLoaded && !this.selectedIssue.relatedLinksLoading) {
                        if (this.selectedIssue.relatedLinks && this.selectedIssue.relatedLinks.length > 0) {
                            this.store$.dispatch(new LoadSelectedIssueRelatedLinksAction(_.map(this.selectedIssue.relatedLinks, 'key')));
                        }
                    }
                    if (this.selectedIssue.issueType === CustomNodeTypes.Epic &&
                        !this.selectedIssue.epicChildrenLoaded && !this.selectedIssue.epicChildrenLoading) {
                        this.store$.dispatch(new LoadSelectedIssueEpicChildrenAction(this.selectedIssue.key));
                    }
                }
            });

        const primaryIssueQuery$ = this.store$.select(p => p.issue.primaryIssue).pipe(filter(p => p));
        const hierarchicalIssueQuery$ = this.store$.select(p => p.issue.hierarchicalIssue).pipe(filter(issue => issue));
        const paramsQuery$ = this.activatedRoute.params
            .pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]));

        this.combined$ = combineLatest(primaryIssueQuery$, hierarchicalIssueQuery$, paramsQuery$)
            .subscribe(([primaryIssue, hierarchicalIssue, selectedIssueKey]) => {
                this.primaryIssue = primaryIssue;

                if (this.primaryIssue.key && selectedIssueKey.toLowerCase() === this.primaryIssue.key.toLowerCase()) {
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
        let extendedFieldList = [];
        if (projectConfig) {
            if (projectConfig.standardIssueTypes) {
                const issueTypeConfig = _.find(projectConfig.standardIssueTypes, { name: issueType });
                if (issueTypeConfig) {
                    extendedFieldList = _.union(extendedFieldList, issueTypeConfig.list)
                }
            }

            // if (projectConfig.subTaskIssueTypes) {
            //     const issueTypeConfig = _.find(projectConfig.subTaskIssueTypes, { name: issueType });
            //     if (issueTypeConfig) {
            //         extendedFieldList = _.union(extendedFieldList, issueTypeConfig.list)
            //     }
            // }

            if (projectConfig.startdate) {
                extendedFieldList.push(projectConfig.startdate);
            }
        }
        return extendedFieldList;
    }

    ngOnDestroy(): void {
        this.destroy()
        this.updatedField$ ? this.updatedField$.unsubscribe() : null;
        this.organization$ ? this.organization$.unsubscribe() : null;
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.selectedIssue$ ? this.selectedIssue$.unsubscribe() : null;
    }

    checkIsPrimaryAndSelectIssueSame = () =>
        this.selectedIssue && this.selectedIssue.key && this.primaryIssue && this.primaryIssue.key &&
        this.primaryIssue.key.toLowerCase() === this.selectedIssue.key.toLowerCase();

    onShowIssuelist() {
        this.router.navigate(['/search/list']);
    }

    ngAfterViewInit(): void {
        this.afterViewInit();
    }
    toggleView() {
        this.store$.dispatch(new ChangeSelectedIssueViewAction(!this.compactView));
    }

    showIssueEntry = false;
    onCancelIssueEntry(args) {
        this.showIssueEntry = false
    }
}
