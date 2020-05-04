import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { JiraService } from '../../lib/jira.service';
import {
    transformParentNode, populateFieldValues, buildIssueLinks, searchTreeByIssueType, CustomNodeTypes, isCustomNode,
    getExtendedFieldValue, getIcon, createEpicChildrenNode, isCustomMenuType, TreeTemplateTypes,
    fieldList, detailFields, populatedFieldList
} from '../../lib/jira-tree-utils';

import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { CachingService } from '../../lib/caching.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../+state/app.state';
import {
    SetCurrentIssueKeyAction, UpsertProjectAction, SetHierarchicalIssueAction, EpicChildrenLoadedAction,
    SetOrganizationAction, DismissProjectSetupAction, ConfigureProjectAction, ToggleQueryEditorVisibilityAction
} from '../../+state/app.actions';
import { Subscription } from 'rxjs';
import { getExtendedFields } from '../../lib/project-config.utils';
import { getRoutelet } from '../../lib/route-utils';
import { Title } from '@angular/platform-browser';
import { SetQueryContextAction } from 'src/app/search/+state/search.actions';

@Component({
    selector: 'app-issueviewer',
    templateUrl: './issueviewer.component.html'
})
export class IssueviewerComponent implements OnInit, OnDestroy {
    localNodeType: any;
    ORG_PLACEHOLDER = "my_org";

    public showOrganizationSetup = false;
    public showHierarchyFieldSetup = false;
    public hierarchyFieldPurpose: any;

    public result: any;
    public treeNodes: any;
    public hierarchicalIssue$: Subscription;

    public selectedNode: any;
    public qpSelected: string;
    public zoom = 100;

    public selectedIssue: any;
    public loadedIssue: any;
    public showDetails = false;
    public issueKey = "storypurpose";
    public contextMenuIssue: any;
    public mappedEpicLinkFieldId: string;
    public allHierarchyAndEpicLinkFields: any;
    public mappedHierarchyFields: any;
    public relatedEpic: any;
    public organization: any;
    public organization$: Subscription;
    public extendedHierarchy: any;
    public extendedHierarchy$: Subscription;

    public purpose = [];
    public menulist: any;
    public masterMenulist: any;
    public hasExtendedFields = false;

    public projects: any;
    projects$: Subscription;
    //projectConfigSetupEditorVisible$: Subscription;
    // showProjectConfigSetup = false;

    currentProject$: Subscription;
    currentProject: any;

    public issueLookup: any;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public titleService: Title,
        public jiraService: JiraService,
        public cachingService: CachingService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.store$.dispatch(new ToggleQueryEditorVisibilityAction(false));

        this.localNodeType = CustomNodeTypes;
        this.initializeMasterMenulist();

        // this.projectConfigSetupEditorVisible$ = this.store$.select(p => p.app.projectConfigEditorVisible)
        //     .pipe(filter(p => p))
        //     .subscribe(p => {
        //         this.currentProject = p;
        //         this.showProjectConfigSetup = true;
        //     });
        this.organization$ = this.store$.select(p => p.app.organization)
            .subscribe(org => this.setOrganizationDetails(org));
        this.extendedHierarchy$ = this.store$.select(p => p.app.extendedHierarchy)
            .subscribe(p => this.extendedHierarchy = p || []);

        this.hierarchicalIssue$ = this.store$.select(p => p.app.hierarchicalIssue)
            .pipe(filter(issueNode => issueNode))
            .subscribe(issueNode => {
                this.treeNodes = [issueNode];
                this.selectedNode = issueNode;
                this.selectedIssue = _.pick(issueNode, ['key', 'label', 'title', 'issueType', 'project', 'extendedFields', 'description']);
            });

        this.currentProject$ = this.store$.select(p => p.app.currentProject)
            .pipe(filter(p => p))
            .subscribe(cp => {
                this.currentProject = cp;
                if (!this.currentProject.isConfigured) {
                    this.currentProject.isConfigured = false;
                }
                this.cachingService.setProjectDetails(cp);
            });

        this.projects$ = this.store$.select(p => p.app.projects).pipe(filter(p => p))
            .subscribe(projects => {
                this.projects = projects;
                this.allHierarchyAndEpicLinkFields = _.flatten(_.map(this.projects, 'hierarchy'));

                this.allHierarchyAndEpicLinkFields = _.union(this.allHierarchyAndEpicLinkFields,
                    _.filter(_.flatten(_.map(this.projects, 'customFields')), { name: "Epic Link" }));

                this.cachingService.setProjects(projects);
            });

        this.activatedRoute.params.pipe(filter(p => p && p["issue"] && p["issue"].length > 0), map(p => p["issue"]))
            .subscribe(issue => {
                this.titleService.setTitle(`${environment.appTitle}: ${issue}`);

                this.store$.dispatch(new SetCurrentIssueKeyAction(issue));
                this.issueKey = issue;
                const extentedHierarchyFields = this.mappedHierarchyFields || this.allHierarchyAndEpicLinkFields || [];

                this.jiraService.getIssueDetails(issue, _.map(extentedHierarchyFields, 'id'))
                    .pipe(filter((p: any) => p !== null && p !== undefined && p.fields))
                    .subscribe((issuedetails: any) => {
                        this.issueLookup = [];
                        this.relatedEpic = null;
                        this.mappedEpicLinkFieldId = this.populateExtendedFields(issuedetails.fields.project);
                        let epicKey = (this.mappedEpicLinkFieldId !== '') ? issuedetails.fields[this.mappedEpicLinkFieldId] : ''

                        if (epicKey && epicKey.length > 0) {
                            this.jiraService.getIssueDetails(epicKey, [])
                                .pipe(filter(p => p !== null && p !== undefined))
                                .subscribe((epicDetails: any) => {
                                    this.relatedEpic = populateFieldValues(epicDetails);
                                    this.onIssueLoaded(issuedetails);
                                });
                        } else {
                            this.onIssueLoaded(issuedetails);
                        }
                    });
            });
    }

    ngOnDestroy(): void {
        this.hierarchicalIssue$ ? this.hierarchicalIssue$.unsubscribe() : null;
        this.projects$ ? this.projects$.unsubscribe() : null;
        this.currentProject$ ? this.currentProject$.unsubscribe() : null;
        this.organization$ ? this.organization$.unsubscribe() : null;
        this.extendedHierarchy$ ? this.extendedHierarchy$.unsubscribe() : null;
    }

    private setOrganizationDetails(org: any): void {
        if (this.treeNodes && this.treeNodes.length > 0 && org) {
            const orgNode = searchTreeByIssueType(this.treeNodes[0], CustomNodeTypes.Organization);
            if (orgNode) {
                orgNode.title = org.name;
                orgNode.label = org.name;
                orgNode.description = org.purpose;
                orgNode.key = org.name;
                orgNode.type = TreeTemplateTypes.Heading;
                orgNode.editable = false;
                orgNode.selectable = false;
            }
        }
        this.organization = org;
    }

    public populateExtendedFields(project) {
        if (this.projects && project) {
            const projectConfigFound = _.find(this.projects, { key: project.key });
            if (projectConfigFound) {

                this.mappedHierarchyFields = projectConfigFound.hierarchy;

                const epicLinkFieldFound = _.find(projectConfigFound.customFields, { name: "Epic Link" });
                return epicLinkFieldFound ? epicLinkFieldFound.id : null;
            }
        }
        return null;
    }
    public onIssueLoaded(issue) {
        this.result = issue;
        this.showDetails = false;
        if (this.result) {
            this.issueLookup = _.union(this.issueLookup, [issue.key]);
            const linkedIssues = buildIssueLinks(this.result);
            if (linkedIssues && linkedIssues.length === 1 && linkedIssues[0].children && linkedIssues[0].children.length > 0) {
                this.issueLookup = _.union(this.issueLookup, _.map(linkedIssues[0].children, 'key'));
            }
            let node = transformParentNode(this.result, linkedIssues);
            if (node.issueType === CustomNodeTypes.Epic) {
                const epicNode = _.find(node.children, { issueType: CustomNodeTypes.EpicChildren });
                if (epicNode) {
                    this.loadEpicChildren(epicNode, node.key, false);
                }
            } else {
                // fix storyboard not loading for the first time
                this.store$.dispatch(new EpicChildrenLoadedAction(true));
            }
            this.loadedIssue = node;

            if (this.loadedIssue.project) {
                this.loadedIssue.extendedFields = getExtendedFields(this.projects, this.loadedIssue.project.key, this.loadedIssue.issueType);
                this.hasExtendedFields = this.loadedIssue.extendedFields && this.loadedIssue.extendedFields.length > 0;
            }

            let hierarchyNode = this.createHierarchyNodes(node);
            let projectNode = this.createProjectNode(node);
            const organizationNode = this.createOrganizationNode();

            projectNode = this.addToLeafNode(organizationNode, projectNode);

            hierarchyNode = this.addToLeafNode(projectNode, hierarchyNode);

            const epicNode = this.populateEpic(node);

            node = this.addToLeafNode(hierarchyNode, epicNode);

            this.store$.dispatch(new SetHierarchicalIssueAction(node));
        }
    }

    // public loadNode(event) {
    //     if (event.node.issueType === CustomNodeTypes.EpicChildren && (!event.node.children || event.node.children.length === 0)) {
    //         this.loadEpicChildren(event.node, event.node.parentId, true);
    //     }
    // }

    private loadEpicChildren(node: any, epicKey, shouldExpand) {

        this.store$.dispatch(new EpicChildrenLoadedAction(false));

        this.jiraService.executeJql(`'epic Link'=${epicKey}`, 0, 100, detailFields, 'epic-children.json')
            .subscribe((data: any) => {
                if (data && data.issues) {
                    const epicChildren = _.map(data.issues, issue => _.pick(populateFieldValues(issue), populatedFieldList));
                    node.children = _.map(epicChildren, (item) => transformParentNode(item, null));;
                    this.issueLookup = _.union(this.issueLookup, _.map(node.children, 'key'))
                    node.expanded = shouldExpand;

                    this.store$.dispatch(new EpicChildrenLoadedAction(true));
                }
            });
    }

    public nodeSelected(event) {
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
            this.store$.dispatch(new SetOrganizationAction(payload));
            this.cachingService.setOrganization(payload);
        }
    }

    private initializeMasterMenulist() {
        this.masterMenulist = [
            {
                label: 'Find related', icon: 'fa fa-bars', menuType: [CustomNodeTypes.Hierarchy, CustomNodeTypes.Organization, CustomNodeTypes.Project],
                command: (args) => {
                    if (args.item && args.item.data) {
                        this.store$.dispatch(new SetQueryContextAction(args.item.data));
                    }
                }
            },
            {
                label: 'Browse', icon: 'fa fa-external-link-alt', menuType: [CustomNodeTypes.Issue, CustomNodeTypes.Epic],
                command: (args) => (args.item && args.item.data)
                    ? this.router.navigate(['..', args.item.data.key, 'purpose', args.item.data.key], { relativeTo: this.activatedRoute })
                    : null
            },
            {
                label: 'Storyboard', icon: 'far fa-map', menuType: [CustomNodeTypes.Epic],
                command: (args) => (args.item && args.item.data)
                    ? this.router.navigate(['storyboard', args.item.data.key, 'details'], { relativeTo: this.activatedRoute })
                    : null
            },
            {
                label: 'Define purpose', icon: 'far fa-lightbulb', menuType: [CustomNodeTypes.Organization],
                command: () => this.showOrganizationSetup = true
            },
            {
                label: 'Define purpose', icon: 'far fa-lightbulb', menuType: [CustomNodeTypes.Hierarchy],
                command: (args) => {
                    if (args.item && args.item.data) {
                        this.hierarchyFieldPurpose = _.pick(args.item.data, ['key', 'hfKey', 'title', 'description', 'issueType']);
                        this.hierarchyFieldPurpose.purpose = this.hierarchyFieldPurpose.description;
                        this.showHierarchyFieldSetup = true;
                    }
                }
                // },
                // {
                //     label: 'Configure', icon: 'far fa-sun', menuType: [CustomNodeTypes.Project],
                //     command: (args) => {
                //         if (args.item && args.item.data) {
                //             this.currentProject = _.find(this.projects, { key: args.item.data.key });
                //             this.showProjectConfigSetup = true;
                //         }
                //     }
            }
        ];
    }

    nodeContextMenuSelect(treeNode) {
        this.menulist = null;
        if (treeNode) {
            const menuType = isCustomMenuType(treeNode) ? treeNode.menuType : CustomNodeTypes.Issue;
            this.menulist = _.filter(this.masterMenulist, (menu) => _.includes(menu.menuType, menuType));

            if (this.menulist && this.menulist.length > 0) {
                this.menulist.forEach(u => u.data = treeNode);
            }
        }
    }

    canTrackProgress = (node) => (node && (node.issueType === CustomNodeTypes.TestSuite || node.issueType === CustomNodeTypes.Story));

    private addToLeafNode(node, nodeToAdd) {
        if (node && nodeToAdd) {
            if (node.children && node.children.length === 1) {
                this.addToLeafNode(node.children[0], nodeToAdd);
            } else {
                node.children = node.children || [];
                node.children.push(nodeToAdd);
            }
        }
        return node || nodeToAdd;
    }

    private populateEpic(node) {
        if (node && node.fields) {
            if (node.issueType === CustomNodeTypes.Epic) {
                node.menuType = CustomNodeTypes.Epic;
            }
            if (this.relatedEpic) {

                const epicChildrenNode = createEpicChildrenNode(node);
                epicChildrenNode.children = this.loadEpicChildren(epicChildrenNode, this.relatedEpic.key, false);
                return {
                    key: this.relatedEpic.key,
                    label: this.relatedEpic.label,
                    title: this.relatedEpic.title,
                    description: this.relatedEpic.description,
                    issueType: CustomNodeTypes.Epic,
                    menuType: CustomNodeTypes.Epic,
                    icon: getIcon(CustomNodeTypes.Epic),
                    project: this.relatedEpic.project,
                    children: [node, epicChildrenNode],
                    expanded: true
                }
            }
        }
        return node;
    }

    private createHierarchyNodes(node: any) {
        const rootNode = { children: [] };
        if (this.mappedHierarchyFields && this.mappedHierarchyFields.length > 0) {
            let tempNode = rootNode;
            this.mappedHierarchyFields.forEach(hf => {
                const extendedValue = getExtendedFieldValue(node, hf.id);

                if (extendedValue.length > 0) {
                    const extendedNode = {
                        key: extendedValue,
                        title: extendedValue,
                        label: extendedValue,
                        description: '',
                        icon: getIcon(CustomNodeTypes.Hierarchy),
                        issueType: hf.name,
                        hfKey: hf.id,
                        children: [],
                        expanded: true,
                        editable: false,
                        isHierarchyField: true,
                        selectable: false,
                        type: TreeTemplateTypes.Heading,
                        menuType: CustomNodeTypes.Hierarchy
                    };

                    //const details: any = this.persistenceService.getExtendedHierarchyDetails(hf.id, extendedNode.key);
                    const details: any = _.find(this.extendedHierarchy, { key: extendedNode.key, hfKey: hf.id })
                    if (details) {
                        extendedNode.description = details.purpose;
                    }
                    tempNode.children.push(extendedNode);
                }
            });
            if (tempNode.children && tempNode.children.length > 0) {
                const tree = tempNode.children[0];
                this.convertToTree(tempNode.children, tree);
                return tree;
            }
        }
        return null;
    }

    convertToTree(list, tree) {
        const subset = list.splice(1, list.length - 1);
        tree.children = subset;
        if (subset && subset.length > 0) {
            this.convertToTree(subset, subset[0]);
        }
    }
    private createProjectNode(node: any) {
        if (node.project) {
            node = {
                key: node.project.key,
                title: node.project.name,
                label: node.project.name,
                type: TreeTemplateTypes.Heading,
                description: node.project.description,
                issueType: CustomNodeTypes.Project,
                menuType: CustomNodeTypes.Project,
                icon: getIcon(CustomNodeTypes.Project),
                expanded: true,
                selectable: false
            };

            const projectDetails: any = this.cachingService.getProjectDetails(node.key);
            if (projectDetails) {
                node.description = projectDetails.description;
                this.store$.dispatch(new UpsertProjectAction(projectDetails));
            }
            else {
                this.jiraService.getProjectDetails(node.key)
                    .subscribe(([pd, fields]) => {
                        const projectDetails: any = pd;
                        if (projectDetails) {
                            node.description = projectDetails.description;
                            projectDetails.customFields = _.sortBy(_.map(_.filter(fields, { custom: true }), (ff) => _.pick(ff, ['id', 'name'])), ['name']);
                            this.store$.dispatch(new UpsertProjectAction(projectDetails));
                        }
                    });
            }
        }
        return node;
    }

    public createOrganizationNode() {
        if (this.organization) {
            return {
                key: this.organization.name,
                title: this.organization.name,
                label: this.organization.name,
                description: this.organization.purpose,
                type: TreeTemplateTypes.Heading,
                menuType: CustomNodeTypes.Organization,
                issueType: CustomNodeTypes.Organization,
                icon: getIcon(CustomNodeTypes.Organization),
                expanded: true,
                editable: false,
                selectable: false
            }
        } else {
            return {
                key: this.ORG_PLACEHOLDER,
                title: '',
                label: 'Organization',
                description: '',
                type: TreeTemplateTypes.Editable,
                menuType: CustomNodeTypes.Organization,
                issueType: CustomNodeTypes.Organization,
                expanded: true,
                editable: true,
                selectable: true
            }
        }
    }

    setupCompleted(shouldReload) {
        this.showOrganizationSetup = false;
        this.showHierarchyFieldSetup = false;
        if (shouldReload) {
            window.location.reload();
        }
    }

    getIssueTitle = (node) => isCustomNode(node)
        ? node.title
        : `[${node.issueType}] ${node.linkType || ''} ${node.key} | ${node.title}`;

    getHeaderTitle = (node) => `[${node.issueType}] ${node.title}`;

    checkIfCustomNode = (node) => isCustomNode(node)

    configureProject() {
        // this.showProjectConfigSetup = true;
        this.store$.dispatch(new ConfigureProjectAction(this.currentProject));
    }
    dismissProjectSetup() {
        if (this.currentProject) {
            this.currentProject.isConfigured = true;
            this.cachingService.setProjectDetails(this.currentProject);
            this.store$.dispatch(new DismissProjectSetupAction(this.currentProject));
        }
    }

    onShowIssuelist() {
        this.router.navigate(['/search/list']);
    }

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

}
