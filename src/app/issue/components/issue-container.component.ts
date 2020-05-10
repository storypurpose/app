import { Component, OnInit, OnDestroy } from '@angular/core';

import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { IssueState } from '../+state/issue.state';
import { LoadIssueDetailsAction, LoadEpicChildrenAction, LoadRelatedLinksAction, LoadProjectDetailsAction } from '../+state/issue.actions';
import { environment } from 'src/environments/environment';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
    createEpicChildrenNode, buildIssueLinkGroups, createOrganizationNode, createProjectNode,
    CustomNodeTypes, TreeTemplateTypes, isCustomNode
} from 'src/app/lib/jira-tree-utils';
import { UpsertProjectAction, SetHierarchicalIssueAction } from 'src/app/+state/app.actions';
import { getRoutelet } from 'src/app/lib/route-utils';

@Component({
    selector: 'app-issue-container',
    templateUrl: './issue-container.component.html'
})
export class IssueContainerComponent implements OnInit, OnDestroy {
    routeParams$: Subscription;
    issueKey: string;

    issueDetails$: Subscription;
    issueDetails: any;

    selectedNode: any;
    menulist: any;

    rootNode: any;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public titleService: Title,
        public store$: Store<IssueState>) {
    }
    ngOnInit(): void {
        this.routeParams$ = this.activatedRoute.params.pipe(filter(p => p && p["issue"] && p["issue"].length > 0), map(p => p["issue"]))
            .subscribe(issue => {
                this.titleService.setTitle(`${environment.appTitle}: ${issue}`);
                this.store$.dispatch(new LoadIssueDetailsAction(issue));
            });

        this.issueDetails$ = this.store$.select(p => p.issue.issueDetails)
            .pipe(filter(p => p))
            .subscribe(details => {
                this.issueDetails = details;
                this.rootNode = createOrganizationNode(this.issueDetails.organization);
                if (this.issueDetails.projectConfigLoaded) {
                    if (this.issueDetails.projectConfig) {
                        this.store$.dispatch(new UpsertProjectAction(this.issueDetails.projectConfig));

                        this.rootNode.children = this.rootNode.children || [];
                        const projectNode: any = createProjectNode(this.issueDetails.projectConfig);
                        projectNode.children = [this.issueDetails];
                        this.rootNode.children.push(projectNode);
                        this.store$.dispatch(new SetHierarchicalIssueAction(this.rootNode));
                    }
                } else {
                    if (this.issueDetails.project && this.issueDetails.project.key && this.issueDetails.project.key.length > 0) {
                        this.store$.dispatch(new LoadProjectDetailsAction(this.issueDetails.project.key));
                    }
                }
                if (this.issueDetails.issueType === CustomNodeTypes.Epic) {
                    this.populateEpicChildren();
                }
                this.populateRelatedLinks();
            });
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
            else {
                this.store$.dispatch(new LoadRelatedLinksAction(_.map(this.issueDetails.relatedLinks, 'key')));
            }
        }
    }

    private populateEpicChildren() {
        if (this.issueDetails.epicChildrenLoaded) {
            const found = _.find(this.issueDetails.children, { issueType: CustomNodeTypes.EpicChildren });
            if (!found && this.issueDetails.epicChildren && this.issueDetails.epicChildren.length > 0) {
                this.issueDetails.children = this.issueDetails.children || [];
                this.issueDetails.children.unshift(createEpicChildrenNode(this.issueDetails));
                this.issueDetails.expanded = true;
            }
        }
        else {
            this.store$.dispatch(new LoadEpicChildrenAction(this.issueDetails.key));
        }
    }

    ngOnDestroy() {
        this.routeParams$ ? this.routeParams$.unsubscribe() : null;
        this.issueDetails$ ? this.issueDetails$.unsubscribe() : null;
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