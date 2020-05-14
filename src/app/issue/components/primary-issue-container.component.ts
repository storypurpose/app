import { Component, OnInit, OnDestroy } from '@angular/core';

import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { IssueState } from '../+state/issue.state';
import {
    LoadPrimaryIssueAction, LoadPrimaryIssueEpicChildrenAction, LoadPrimaryIssueRelatedLinksAction,
    LoadProjectDetailsAction, UpdateOrganizationTitleAction
} from '../+state/issue.actions';
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
    selector: 'app-primary-issue-container',
    templateUrl: './primary-issue-container.component.html'
})
export class IssueContainerComponent implements OnInit, OnDestroy {
    combined$: Subscription;
    issueKey: string;

    primaryIssue$: Subscription;
    primaryIssue: any;

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

    ngOnDestroy() {
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
            else if (!this.primaryIssue.relatedLinksLoading) {
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
        }
        else if (this.primaryIssue.project && this.primaryIssue.project.key && this.primaryIssue.project.key.length > 0
            && !this.primaryIssue.projectConfigLoading) {
            this.store$.dispatch(new LoadProjectDetailsAction(this.primaryIssue.project.key));
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

    cancelNodeEditingOnEscape = (eventArgs, node) => {
        eventArgs.stopPropagation();
        eventArgs.preventDefault();
        this.cancelNodeEditing(node);
    }

    public cancelNodeEditing(node) {
        if (node.memento) {
            node.title = '';
            node.type = node.memento.type;
            setTimeout(() => node.selectable = node.memento.selectable, 200);
        }
    }

    public canUpdateTitle = (node) => node && node.title && node.title.trim().length > 0;

    updateNodeTitleOnEnter = (eventArgs, node) => {
        eventArgs.stopPropagation();
        eventArgs.preventDefault();
        this.updateNodeTitle(node);
    }
    public updateNodeTitle(node) {
        if (node.title && node.title.length > 0) {
            node.type = TreeTemplateTypes.Heading;
            node.selectable = false;
            node.key = node.title;
            const payload = { name: node.title };
            this.store$.dispatch(new UpdateOrganizationTitleAction(payload));
        }
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
