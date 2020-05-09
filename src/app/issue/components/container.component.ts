import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription, Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, searchTreeByKey, copyFieldValues, populateFieldValues, searchTreeByIssueType } from 'src/app/lib/jira-tree-utils';
import { CachingService } from 'src/app/lib/caching.service';
import { SetPurposeAction, SetSelectedItemAction, UpdateOrganizationPurposeAction } from '../+state/issue.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState } from 'src/app/+state/app.state';
import { getExtendedFields } from 'src/app/lib/project-config.utils';
import { populatedFieldList } from 'src/app/lib/jira-tree-utils';
import { JiraService } from 'src/app/lib/jira.service';
import { IssueState } from '../+state/issue.state';

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html'
})
export class SelectedItemContainerComponent implements OnInit, OnDestroy {

    epicChildrenLoadedQuery$: Observable<any>;
    hierarchicalIssueQuery$: Observable<any>;
    paramsQuery$: Observable<any>;
    projectsQuery$: Observable<any>;
    queryParamsQuery$: Observable<any>;

    combined$: Subscription;
    epicChildrenLoaded$: Subscription;

    updatedField$: Subscription;

    selectedItem$: Subscription;
    selectedItem: any;

    organization$: Subscription;

    currentIssueKey$: Subscription;
    currentIssueKey = '';

    purpose: any;
    projects: any;

    localNodeType: any;
    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public cachingService: CachingService,
        public jiraService: JiraService,
        public store$: Store<AppState>
    ) {
    }
    ngOnInit(): void {
        this.localNodeType = CustomNodeTypes;

        this.updatedField$ = this.store$.select(p => p.issue.updatedField)
            .pipe(filter(p => p))
            .subscribe(p => this.router.navigate([], { queryParams: { updated: p.issueKey } }));

        this.organization$ = this.store$.select(p => p.app.organization)
            .pipe(filter(p => p))
            .subscribe(org => this.store$.dispatch(new UpdateOrganizationPurposeAction(org)));

        this.currentIssueKey$ = this.store$.select(p => p.app.currentIssueKey)
            .pipe(filter(p => p && p.length > 0))
            .subscribe(key => this.currentIssueKey = key);

        this.selectedItem$ = this.store$.select(p => p.issue.selectedItem)
            .pipe(filter(p => p))
            .subscribe(p => this.selectedItem = p);

        this.epicChildrenLoadedQuery$ = this.store$.select(p => p.app.epicChildrenLoaded).pipe(filter(issue => issue === true));
        this.hierarchicalIssueQuery$ = this.store$.select(p => p.app.hierarchicalIssue).pipe(filter(issue => issue));
        this.paramsQuery$ = this.activatedRoute.params.pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]));
        this.queryParamsQuery$ = this.activatedRoute.queryParams;
        this.projectsQuery$ = this.store$.select(p => p.app.projects).pipe(filter(p => p))

        this.combined$ = combineLatest(this.hierarchicalIssueQuery$, this.paramsQuery$, this.queryParamsQuery$, this.projectsQuery$, this.epicChildrenLoadedQuery$)
            .subscribe(([hierarchicalIssue, rpSelected, qp, projects, epicChildrenLoaded]) => {
                console.log('qp', qp);
                this.selectItem(projects, hierarchicalIssue, rpSelected, epicChildrenLoaded);
            })
    }

    private selectItem(projects: any, hierarchicalIssue: any, rpSelected: any, epicChildrenLoaded: boolean) {
        this.projects = projects;
        const currentProject = searchTreeByIssueType(hierarchicalIssue, CustomNodeTypes.Project);
        const selectedNode = searchTreeByKey(hierarchicalIssue, rpSelected);
        if (currentProject && selectedNode) {
            selectedNode.extendedFields = getExtendedFields(this.projects, currentProject.key, selectedNode.issueType);
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
                    selectedItem.project = _.find(projects, { key: selectedItem.project.key });
                    this.store$.dispatch(new SetSelectedItemAction(selectedItem));
                });
        }
        setTimeout(() => this.markIssueSelected(selectedNode), 500);
    }

    ngOnDestroy(): void {
        this.updatedField$ ? this.updatedField$.unsubscribe() : null;
        this.epicChildrenLoaded$ ? this.epicChildrenLoaded$.unsubscribe() : null;
        this.organization$ ? this.organization$.unsubscribe() : null;
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.selectedItem$ ? this.selectedItem$.unsubscribe() : null;
        this.currentIssueKey$ ? this.currentIssueKey$.unsubscribe() : null;
    }

    private markIssueSelected(node: any) {
        if (node) {
            if (this.projects && node.project) {
                node.extendedFields = getExtendedFields(this.projects, node.project.key, node.issueType);
            }
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
        this.purpose = [];
        this.populatePurpose(node);
        _.reverse(this.purpose);
        if (this.purpose.length > 0) {
            this.purpose[this.purpose.length - 1].show = true;
        }
        this.store$.dispatch(new SetPurposeAction(this.purpose));
    }

    public populatePurpose(node) {
        if (node) {
            if (node.issueType !== CustomNodeTypes.EpicChildren && node.issueType !== CustomNodeTypes.RelatedLink) {
                this.purpose.push({
                    key: node.key, issueType: node.issueType, title: node.title, purpose: node.description,
                    editable: node.editable, hfKey: node.hfKey, show: false
                });
            }
            if (node.parent) {
                this.populatePurpose(node.parent);
            }
        }
    }

    canNavigateToStoryboard() {
        return this.selectedItem &&
            (this.selectedItem.issueType === 'Epic' || this.currentIssueKey.toLowerCase() === this.selectedItem.key.toLowerCase());
    }

    prepareExternalUrl(issueKey) {
        const connectionDetails = this.cachingService.getConnectionDetails();

        return (connectionDetails && connectionDetails.serverUrl && connectionDetails.serverUrl.length > 0)
            ? `${connectionDetails.serverUrl}/browse/${issueKey}`
            : '';
    }
}
