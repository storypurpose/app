import { Component, OnInit, OnDestroy } from '@angular/core';

import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { IssueState } from '../+state/issue.state';
import { LoadIssueDetailsAction as LoadPrimaryIssueAction, LoadEpicChildrenAction, LoadRelatedLinksAction, LoadProjectDetailsAction } from '../+state/issue.actions';
import { environment } from 'src/environments/environment';
import { filter, map } from 'rxjs/operators';
import { Subscription, combineLatest } from 'rxjs';
import {
    createEpicChildrenNode, buildIssueLinkGroups, createOrganizationNode, createProjectNode,
    CustomNodeTypes, TreeTemplateTypes, isCustomNode, getExtendedFieldValue, getIcon, createHierarchyNode, convertToTree, addToLeafNode
} from 'src/app/lib/jira-tree-utils';
import { UpsertProjectAction, SetHierarchicalIssueAction } from 'src/app/+state/app.actions';
import { getRoutelet } from 'src/app/lib/route-utils';

@Component({
    selector: 'app-issue-container',
    templateUrl: './issue-container.component.html'
})
export class IssueContainerComponent implements OnInit, OnDestroy {
    combined$: Subscription;
    issueKey: string;

    issueDetails$: Subscription;
    issueDetails: any;

    selectedNode: any;
    menulist: any;

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
        const paramsQ = this.activatedRoute.params.pipe(filter(p => p && p["issue"] && p["issue"].length > 0), map(p => p["issue"]));
        const projectsQ = this.store$.select(p => p.app.projects);
        this.combined$ = combineLatest(paramsQ, projectsQ)
            .subscribe(([issue, projects]) => {
                this.titleService.setTitle(`${environment.appTitle}: ${issue}`);
                if (projects) {
                    this.extendedFields = _.union(
                        _.flatten(_.map(projects, 'hierarchy')),
                        _.filter(_.flatten(_.map(projects, 'customFields')), { name: "Epic Link" })
                    );
                }
                this.store$.dispatch(new LoadPrimaryIssueAction({ issue, extendedFields: this.extendedFields }));
            });

        this.issueDetails$ = this.store$.select(p => p.issue.primaryIssue)
            .pipe(filter(p => p))
            .subscribe(details => {
                this.issueDetails = details;
                this.populateProjectConfig();
                this.populateEpicChildren();
                this.populateRelatedLinks();

                this.buildTree();
            });
    }

    ngOnDestroy() {
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.issueDetails$ ? this.issueDetails$.unsubscribe() : null;
    }

    private buildTree() {
        if (this.issueDetails.epicChildrenLoaded === true && this.issueDetails.relatedLinksLoaded === true
            && this.issueDetails.projectConfigLoaded === true) {
            const organizationNode = createOrganizationNode(this.issueDetails.organization);
            let projectNode: any = createProjectNode(this.issueDetails.projectConfig);
            let hierarchyNode = (this.issueDetails.projectConfig.hierarchy) ? this.prepareHierarchyNodes() : null;

            projectNode = addToLeafNode(organizationNode, projectNode);
            hierarchyNode = addToLeafNode(projectNode, hierarchyNode);

            //const epicNode = this.populateEpic(node);

            this.rootNode = addToLeafNode(hierarchyNode, this.issueDetails);

            this.store$.dispatch(new SetHierarchicalIssueAction(this.rootNode));
        }
    }

    private prepareHierarchyNodes() {
        const hierarchyNodes = { children: [] };
        this.issueDetails.projectConfig.hierarchy.forEach(field => {
            const found: any = _.find(this.issueDetails.extendedFields, { id: field.id });
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
        if (this.issueDetails.issueType === CustomNodeTypes.Epic) {
            if (this.issueDetails.epicChildrenLoaded) {
                const epicChildrenNodeAlreadyExists = _.find(this.issueDetails.children, { issueType: CustomNodeTypes.EpicChildren });
                if (!epicChildrenNodeAlreadyExists && this.issueDetails.epicChildren && this.issueDetails.epicChildren.length > 0) {
                    this.issueDetails.children = this.issueDetails.children || [];
                    this.issueDetails.children.unshift(createEpicChildrenNode(this.issueDetails));
                    this.issueDetails.expanded = true;
                }
            }
            else if (!this.issueDetails.epicChildrenLoading) {
                this.store$.dispatch(new LoadEpicChildrenAction(this.issueDetails.key));
            }
        } else {
            this.issueDetails.epicChildrenLoaded = true;
        }
    }

    private populateRelatedLinks() {
        if (this.issueDetails.relatedLinks && this.issueDetails.relatedLinks.length > 0) {
            if (this.issueDetails.relatedLinksLoaded) {
                const relatedLinks = _.filter(this.issueDetails.children, { issueType: CustomNodeTypes.RelatedLink });
                if (relatedLinks.length === 0) {
                    const linkedRecords = buildIssueLinkGroups(this.issueDetails.relatedLinks, this.issueDetails.key);
                    if (linkedRecords) {
                        this.issueDetails.children = this.issueDetails.children || [];
                        linkedRecords.forEach(u => this.issueDetails.children.push(u));
                    }
                }
            }
            else if (!this.issueDetails.relatedLinksLoading) {
                this.store$.dispatch(new LoadRelatedLinksAction(_.map(this.issueDetails.relatedLinks, 'key')));
            }
        } else {
            this.issueDetails.relatedLinksLoaded = true;
        }
    }

    private populateProjectConfig() {
        if (this.issueDetails.projectConfigLoaded) {
            if (this.issueDetails.projectConfig) {
                this.store$.dispatch(new UpsertProjectAction(this.issueDetails.projectConfig));
            }
        }
        else {
            if (this.issueDetails.project && this.issueDetails.project.key && this.issueDetails.project.key.length > 0
                && !this.issueDetails.projectConfigLoading) {
                this.store$.dispatch(new LoadProjectDetailsAction(this.issueDetails.project.key));
            } else {
                this.issueDetails.projectConfigLoaded = true
            }
        }
    }

    onShowIssuelist() {
        this.router.navigate(['/search/list']);
    }

    //#region node functions
    nodeSelected(event) {
        if (event.node.editable) {
            event.node.memento = { type: event.node.type, selectable: event.node.selectable };
            event.node.type = TreeTemplateTypes.Editing;
            event.node.selectable = false;
        }
        else {
            let routelet = getRoutelet(this.router, 'details');
            this.router.navigate(['purpose', event.node.key, routelet], { relativeTo: this.activatedRoute });
        }
    }
    nodeContextMenuSelect(node) {
        console.log(node);
    }
    updateNodeTitleOnEnter(eventArgs, node) {
        console.log(eventArgs, node);
    }
    cancelNodeEditingOnEscape(eventArgs, node) {
        console.log(eventArgs, node);
    }

    public canUpdateTitle = (node) => node && node.title && node.title.trim().length > 0;

    updateNodeTitle(node) {
        console.log(node);
    }
    cancelNodeEditing(node) {
        console.log(node);
    }

    getIssueTitle = (node) =>
        isCustomNode(node) ? node.title : `[${node.issueType}] ${node.linkType || ''} ${node.key} | ${node.title}`;

    getHeaderTitle = (node) => `[${node.issueType}] ${node.title}`;

    checkIfCustomNode = (node) => isCustomNode(node)

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
