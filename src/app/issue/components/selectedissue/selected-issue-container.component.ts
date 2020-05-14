import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, searchTreeByKey } from 'src/app/lib/jira-tree-utils';
import { CachingService } from 'src/app/lib/caching.service';
import { UpdateOrganizationPurposeAction, SetSelectedIssueAction,
    LoadSelectedIssueAction, LoadSelectedIssueEpicChildrenAction,  LoadSelectedIssueRelatedLinksAction } from '../../+state/issue.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueState } from '../../+state/issue.state';

@Component({
    selector: 'app-selected-issue-container',
    templateUrl: './selected-issue-container.component.html'
})
export class SelectedIssueContainerComponent implements OnInit, OnDestroy {
    combined$: Subscription;

    updatedField$: Subscription;

    selectedIssue$: Subscription;
    selectedIssue: any;

    organization$: Subscription;

    primaryIssue: any;

    localNodeType: any;
    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public cachingService: CachingService,
        public store$: Store<IssueState>
    ) {
    }
    ngOnInit(): void {
        this.localNodeType = CustomNodeTypes;

        this.updatedField$ = this.store$.select(p => p.issue.updatedField).pipe(filter(p => p))
            .subscribe(p => this.router.navigate([], { queryParams: { updated: p.issueKey } }));

        this.organization$ = this.store$.select(p => p.app.organization).pipe(filter(p => p))
            .subscribe(org => this.store$.dispatch(new UpdateOrganizationPurposeAction(org)));

        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue).pipe(filter(p => p))
            .subscribe(selectedIssue => {
                this.selectedIssue = selectedIssue;
                if (!this.selectedIssue.relatedLinksLoaded && !this.selectedIssue.relatedLinksLoading) {
                    this.store$.dispatch(new LoadSelectedIssueRelatedLinksAction(_.map(this.selectedIssue.relatedLinks, 'key')));
                }
                if (this.selectedIssue.issueType === CustomNodeTypes.Epic &&
                    !this.selectedIssue.epicChildrenLoaded && !this.selectedIssue.epicChildrenLoading) {
                    this.store$.dispatch(new LoadSelectedIssueEpicChildrenAction(this.selectedIssue.key));
                }
            });

        const primaryIssueQuery$ = this.store$.select(p => p.issue.primaryIssue).pipe(filter(p => p));
        const hierarchicalIssueQuery$ = this.store$.select(p => p.app.hierarchicalIssue).pipe(filter(issue => issue));
        const paramsQuery$ = this.activatedRoute.params
            .pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]));
        const queryParamsQuery$ = this.activatedRoute.queryParams;

        this.combined$ = combineLatest(primaryIssueQuery$, hierarchicalIssueQuery$, paramsQuery$, queryParamsQuery$)
            .subscribe(([primaryIssue, hierarchicalIssue, selectedIssueKey]) => {
                this.primaryIssue = primaryIssue;

                if (selectedIssueKey.toLowerCase() === this.primaryIssue.key.toLowerCase()) {
                    this.store$.dispatch(new SetSelectedIssueAction(primaryIssue));
                } else {
                    if (!this.selectedIssue || this.selectedIssue.key.toLowerCase() !== selectedIssueKey.toLowerCase()) {
                        const hierarchicalNode = searchTreeByKey(hierarchicalIssue, selectedIssueKey);
                        let extendedFields = hierarchicalNode
                            ? this.populateExtendedFields(primaryIssue.projectConfig, hierarchicalNode.issueType)
                            : [];

                        this.store$.dispatch(new LoadSelectedIssueAction({ issue: selectedIssueKey, extendedFields }));
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

    prepareExternalUrl(issueKey) {
        const connectionDetails = this.cachingService.getConnectionDetails();

        return (connectionDetails && connectionDetails.serverUrl && connectionDetails.serverUrl.length > 0)
            ? `${connectionDetails.serverUrl}/browse/${issueKey}`
            : '';
    }
}
