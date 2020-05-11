import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription, Observable, combineLatest } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, searchTreeByKey, copyFieldValues, populateFieldValues, searchTreeByIssueType } from 'src/app/lib/jira-tree-utils';
import { CachingService } from 'src/app/lib/caching.service';
import { SetPurposeAction, SetSelectedItemAction, UpdateOrganizationPurposeAction } from '../../+state/issue.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { getExtendedFields } from 'src/app/lib/project-config.utils';
import { populatedFieldList } from 'src/app/lib/jira-tree-utils';
import { JiraService } from 'src/app/lib/jira.service';
import { IssueState } from '../../+state/issue.state';

@Component({
    selector: 'app-selected-issue-container',
    templateUrl: './container.component.html'
})
export class SelectedIssueContainerComponent implements OnInit, OnDestroy {

    hierarchicalIssueQuery$: Observable<any>;
    paramsQuery$: Observable<any>;
    queryParamsQuery$: Observable<any>;

    combined$: Subscription;

    updatedField$: Subscription;

    selectedItem$: Subscription;
    selectedIssue: any;

    organization$: Subscription;

    primaryIssue$: Subscription;
    primaryIssue: any;

    localNodeType: any;
    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public cachingService: CachingService,
        public jiraService: JiraService,
        public store$: Store<IssueState>
    ) {
    }
    ngOnInit(): void {
        this.localNodeType = CustomNodeTypes;

        this.updatedField$ = this.store$.select(p => p.issue.updatedField).pipe(filter(p => p))
            .subscribe(p => this.router.navigate([], { queryParams: { updated: p.issueKey } }));

        this.organization$ = this.store$.select(p => p.app.organization).pipe(filter(p => p))
            .subscribe(org => this.store$.dispatch(new UpdateOrganizationPurposeAction(org)));

        this.primaryIssue$ = this.store$.select(p => p.issue.primaryIssue).pipe(filter(p => p))
            .subscribe(primaryIssue => this.primaryIssue = primaryIssue);

        this.selectedItem$ = this.store$.select(p => p.issue.selectedIssue).pipe(filter(p => p))
            .subscribe(p => this.selectedIssue = p);

        this.hierarchicalIssueQuery$ = this.store$.select(p => p.app.hierarchicalIssue).pipe(filter(issue => issue));
        this.paramsQuery$ = this.activatedRoute.params.pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]));
        this.queryParamsQuery$ = this.activatedRoute.queryParams;

        this.combined$ = combineLatest(this.hierarchicalIssueQuery$, this.paramsQuery$, this.queryParamsQuery$)
            .subscribe(([hierarchicalIssue, rpSelected, qp]) => {
                this.selectItem(hierarchicalIssue, rpSelected);
            })
    }

    private selectItem(hierarchicalIssue: any, rpSelected: any) {
        const currentProject = searchTreeByIssueType(hierarchicalIssue, CustomNodeTypes.Project);
        const selectedNode = searchTreeByKey(hierarchicalIssue, rpSelected);
        if (currentProject && selectedNode) {

            selectedNode.extendedFields = [];
            this.populateExtendedFields(selectedNode);

            //selectedNode.extendedFields = getExtendedFields(this.projects, currentProject.key, selectedNode.issueType);
            const fieldList = _.map(selectedNode.extendedFields, 'id');
            this.jiraService.getIssueDetails(rpSelected, fieldList)
                .pipe(filter((p: any) => p !== null && p !== undefined && p.fields))
                .subscribe((issuedetails: any) => {
                    copyFieldValues(populateFieldValues(issuedetails), selectedNode);
                    selectedNode.extendedFields = _.map(selectedNode.extendedFields, (ef) => {
                        ef.value = issuedetails.fields[ef.id];
                        return ef;
                    });
                    const localFieldList = _.concat(populatedFieldList, ['extendedFields', 'children'])
                    const selectedItem = _.pick(selectedNode, localFieldList);
                    selectedItem.project = this.primaryIssue ? this.primaryIssue.projectConfig : null;
                    this.store$.dispatch(new SetSelectedItemAction(selectedItem));
                });
        }
        setTimeout(() => this.markIssueSelected(selectedNode), 500);
    }

    private populateExtendedFields(selectedNode: any) {
        if (this.primaryIssue && this.primaryIssue.projectConfig && this.primaryIssue.projectConfig.standardIssueTypes) {
            const issueTypeConfig = _.find(this.primaryIssue.projectConfig.standardIssueTypes, { name: selectedNode.issueType });
            selectedNode.extendedFields = (issueTypeConfig) ? issueTypeConfig.list || [] : [];
        }
    }

    ngOnDestroy(): void {
        this.updatedField$ ? this.updatedField$.unsubscribe() : null;
        this.organization$ ? this.organization$.unsubscribe() : null;
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.selectedItem$ ? this.selectedItem$.unsubscribe() : null;
        this.primaryIssue$ ? this.primaryIssue$.unsubscribe() : null;
    }

    private markIssueSelected(node: any) {
        if (node) {
            this.populateExtendedFields(node);

            if (node.parent && node.parent.issueType === CustomNodeTypes.RelatedLink && (!node.description || node.description.length === 0)) {
                const fieldList = _.map(node.extendedFields, 'id');
                this.jiraService.getIssueDetails(node.key, fieldList)
                    .pipe(filter(p => p !== null && p !== undefined))
                    .subscribe((linkedIssue: any) => {
                        const loaded = populateFieldValues(linkedIssue);
                        if (loaded) {
                            copyFieldValues(loaded, node);
                        }

                        node.extendedFields = _.map(node.extendedFields, (ef) => {
                            ef.value = linkedIssue.fields[ef.id];
                            return ef;
                        });
                        this.expandPurpose(node);
                    });
            } else {
                this.expandPurpose(node);
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
        this.store$.dispatch(new SetPurposeAction(purpose));
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

    canNavigateToStoryboard() {
        return this.selectedIssue && this.primaryIssue &&
            (this.selectedIssue.issueType === 'Epic' || this.primaryIssue.key.toLowerCase() === this.selectedIssue.key.toLowerCase());
    }

    prepareExternalUrl(issueKey) {
        const connectionDetails = this.cachingService.getConnectionDetails();

        return (connectionDetails && connectionDetails.serverUrl && connectionDetails.serverUrl.length > 0)
            ? `${connectionDetails.serverUrl}/browse/${issueKey}`
            : '';
    }
}
