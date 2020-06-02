import { Component, OnInit, OnDestroy } from '@angular/core';

import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { IssueState } from '../+state/issue.state';
import {
    LoadPrimaryIssueAction, LoadPrimaryIssueEpicChildrenAction, LoadPrimaryIssueRelatedLinksAction,
    LoadProjectDetailsAction, SetHierarchicalIssueAction
} from '../+state/issue.actions';
import { environment } from 'src/environments/environment';
import { filter, map } from 'rxjs/operators';
import { Subscription, combineLatest } from 'rxjs';
import {
    createEpicChildrenNode, buildIssueLinkGroups, createOrganizationNode, createProjectNode,
    CustomNodeTypes, createHierarchyNode, convertToTree, addToLeafNode
} from 'src/app/lib/jira-tree-utils';
import { UpsertProjectAction } from 'src/app/+state/app.actions';

@Component({
    selector: 'app-primary-issue-container',
    templateUrl: './primary-issue-container.component.html'
})
export class IssueContainerComponent implements OnInit, OnDestroy {
    currentProject$: Subscription;
    updatedField$: Subscription;
    combined$: Subscription;
    issueKey: string;

    primaryIssue$: Subscription;
    primaryIssue: any;

    menulist: any;

    //selectedNode: any;
    rootNode: any;

    projects$: Subscription;
    extendedFields = [];
    public allHierarchyAndEpicLinkFields: any;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public titleService: Title,
        public store$: Store<IssueState>) {
    }
    ngOnInit(): void {

        this.reloadOnChange();

        const paramsQ = this.activatedRoute.params.pipe(filter(p => p && p["issue"] && p["issue"].length > 0), map(p => p["issue"]));
        const allExtendedFieldsQ = this.store$.select(p => p.app.allExtendedFields);

        this.combined$ = combineLatest(paramsQ, allExtendedFieldsQ)
            .subscribe(([issue, allExtendedFields]) => {
                this.titleService.setTitle(`${environment.appTitle}: ${issue}`);
                const diff = _.xorBy(this.extendedFields, allExtendedFields, 'id');
                if (diff.length > 0 || allExtendedFields.length === 0 || !this.primaryIssue || this.primaryIssue.key !== issue) {
                    this.extendedFields = allExtendedFields;
                    this.store$.dispatch(new LoadPrimaryIssueAction({ issue, extendedFields: this.extendedFields }));
                }
            });

        this.primaryIssue$ = this.store$.select(p => p.issue.primaryIssue)
            .pipe(filter(p => p))
            .subscribe(details => {
                this.primaryIssue = details;
                this.populateProjectConfig();
                this.populateEpicChildren();
                this.populateRelatedLinks();

                this.buildTree();
            });
    }

    private reloadOnChange() {
        this.currentProject$ = this.store$.select(p => p.app.currentProject)
            .pipe(filter(() => this.primaryIssue))
            .subscribe((updatedProject) => {
                if (this.primaryIssue && updatedProject) {
                    const found = _.find(updatedProject.standardIssueTypes, { name: this.primaryIssue.issueType });
                    if (found) {
                        const projectFields = _.union(found.list, _.filter(updatedProject.customFields, { name: 'Epic Link' }));
                        if (updatedProject.startdate) {
                            projectFields.push(updatedProject.startdate);
                        }
                        const diff = [];
                        projectFields.forEach(pf => {
                            !_.find(this.extendedFields, { id: pf.id }) ? diff.push(pf) : null;
                        })

                        if (diff.length > 0) {
                            this.extendedFields = _.clone(projectFields);
                            this.store$.dispatch(new LoadPrimaryIssueAction({ issue: this.primaryIssue.key, extendedFields: this.extendedFields }));
                        }
                    }
                }
            });
        this.updatedField$ = this.store$.select(p => p.issue.updatedField).pipe(filter(fieldUpdated => fieldUpdated && this.primaryIssue))
            .subscribe((fu) => {
                this.store$.dispatch(new LoadPrimaryIssueAction({ issue: this.primaryIssue.key, extendedFields: this.extendedFields }));
            });
    }

    ngOnDestroy() {
        this.currentProject$ ? this.currentProject$.unsubscribe() : null;
        this.updatedField$ ? this.updatedField$.unsubscribe() : null;
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.primaryIssue$ ? this.primaryIssue$.unsubscribe() : null;
    }

    private buildTree() {
        if (this.primaryIssue.epicChildrenLoaded === true && this.primaryIssue.relatedLinksLoaded === true
            && this.primaryIssue.projectConfigLoaded === true) {
            const organizationNode = createOrganizationNode(this.primaryIssue.organization);
            let projectNode: any = createProjectNode(this.primaryIssue.projectConfig);
            let hierarchyNode = (this.primaryIssue.projectConfig.hierarchy) ? this.prepareHierarchyNodes() : null;

            projectNode = addToLeafNode(organizationNode, projectNode);
            hierarchyNode = addToLeafNode(projectNode, hierarchyNode);

            //const epicNode = this.populateEpic(node);
            this.primaryIssue.expanded = true;
            this.rootNode = addToLeafNode(hierarchyNode, this.primaryIssue);

            this.store$.dispatch(new SetHierarchicalIssueAction(this.rootNode));
        }
    }

    private prepareHierarchyNodes() {
        const hierarchyNodes = { children: [] };
        this.primaryIssue.projectConfig.hierarchy.forEach(field => {
            const found: any = _.find(this.primaryIssue.extendedFields, { id: field.id });
            if (found && found.extendedValue && found.extendedValue.length > 0) {
                hierarchyNodes.children.push(createHierarchyNode(found));
            }
        });
        if (hierarchyNodes.children.length > 0) {
            const hierarchyTree = hierarchyNodes.children[0];
            convertToTree(hierarchyNodes.children, hierarchyTree);
            return hierarchyTree
        }
        return null
    }

    private populateEpicChildren() {
        if (this.primaryIssue.issueType === CustomNodeTypes.Epic) {
            if (this.primaryIssue.epicChildrenLoaded) {
                const epicChildrenNodeAlreadyExists = _.find(this.primaryIssue.children, { issueType: CustomNodeTypes.EpicChildren });
                if (!epicChildrenNodeAlreadyExists && this.primaryIssue.epicChildren && this.primaryIssue.epicChildren.length > 0) {
                    this.primaryIssue.children = this.primaryIssue.children || [];
                    this.primaryIssue.children.unshift(createEpicChildrenNode(this.primaryIssue));
                    this.primaryIssue.expanded = true;
                }
            }
            else if (!this.primaryIssue.epicChildrenLoading) {
                this.store$.dispatch(new LoadPrimaryIssueEpicChildrenAction(this.primaryIssue.key));
            }
        } else {
            this.primaryIssue.epicChildrenLoaded = true;
        }
    }

    private populateRelatedLinks() {
        if (this.primaryIssue && this.primaryIssue.relatedLinks && this.primaryIssue.relatedLinks.length > 0) {
            if (this.primaryIssue.relatedLinksLoaded) {
                const relatedLinks = _.filter(this.primaryIssue.children, { issueType: CustomNodeTypes.RelatedLink });
                if (relatedLinks.length === 0) {
                    const linkedRecords = buildIssueLinkGroups(this.primaryIssue.relatedLinks, this.primaryIssue.key);
                    if (linkedRecords) {
                        this.primaryIssue.children = this.primaryIssue.children || [];
                        linkedRecords.forEach(u => this.primaryIssue.children.push(u));
                    }
                }
            }
            else if (!this.primaryIssue.relatedLinksLoading && this.primaryIssue.relatedLinks && this.primaryIssue.relatedLinks.length > 0) {
                this.store$.dispatch(new LoadPrimaryIssueRelatedLinksAction(_.map(this.primaryIssue.relatedLinks, 'key')));
            }
        } else {
            this.primaryIssue.relatedLinksLoaded = true;
        }
    }

    private populateProjectConfig() {
        if (this.primaryIssue.projectConfigLoaded) {
            if (this.primaryIssue.projectConfig) {
                this.store$.dispatch(new UpsertProjectAction(this.primaryIssue.projectConfig));
            }
        } else if (this.primaryIssue.project && this.primaryIssue.project.key && this.primaryIssue.project.key.length > 0
            && !this.primaryIssue.projectConfigLoading) {
            this.store$.dispatch(new LoadProjectDetailsAction(this.primaryIssue.project.key));
        }
    }

    nodeContextMenuSelect(node) {
        console.log(node);
    }
    //#endregion

    //#region toggle fullscreen
    leftPaneSize = 20;
    public columns: any = [{ visible: true, size: 20 }, { visible: true, size: 80 }];
    dragEnd(e: { gutterNum: number; sizes: Array<number> }) {
        this.adjustPaneSize(e.sizes[0]);
    }
    public adjustPaneSize(sizeOfLeftPane) {
        this.leftPaneSize = sizeOfLeftPane;
        this.columns[0].size = sizeOfLeftPane;
        this.columns[1].size = 100 - sizeOfLeftPane;
    }
    toggleFullscreen() {
        this.adjustPaneSize(this.leftPaneSize === 0 ? 20 : 0);
    }
    //#endregion
}
