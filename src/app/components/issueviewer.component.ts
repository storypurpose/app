import { Component, OnInit, OnDestroy } from '@angular/core';
import { JiraService } from '../lib/jira.service';
import {
    transformParentNode, populateFieldValues, buildIssueLinks,
    CustomNodeTypes, isCustomNode, getExtendedFieldValue, getIcon, createEpicChildrenNode
} from '../lib/jira-tree-utils';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { PersistenceService } from '../lib/persistence.service';
import { Store } from '@ngrx/store';
import { ManageOrganizationEditorVisibilityAction, ManageHierarchyEditorVisibilityAction } from '../purpose/+state/purpose.actions';
import { AppState } from '../+state/app.state';
import { SetCurrentIssueKeyAction, UpsertProjectAction, SetHierarchicalIssueAction } from '../+state/app.actions';
import { Subscription } from 'rxjs';
import { getExtendedFields } from '../lib/project-config.utils';

@Component({
    selector: 'app-issueviewer',
    templateUrl: './issueviewer.component.html'
})
export class IssueviewerComponent implements OnInit, OnDestroy {
    public initiativeToEdit: any;
    public showInitiativeSetup = false;

    public title = 'text-matrix';
    public keyId = "GBP-35381";
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
    public organizationDetails: any;

    public purpose = [];
    public menulist: any;
    public masterMenulist: any;
    public hasExtendedFields = false;

    public connectionDetails: any;
    connectionDetails$: Subscription;

    public projects: any;
    projects$: Subscription;
    showProjectConfigSetup = false;
    currentProject: any;
    currentProject$: Subscription;

    public issueLookup: any;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public jiraService: JiraService,
        public persistenceService: PersistenceService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {

        this.initializeMasterMenulist();

        this.hierarchicalIssue$ = this.store$.select(p => p.app.hierarchicalIssue)
            .pipe(filter(issueNode => issueNode))
            .subscribe(issueNode => {
                this.treeNodes = [issueNode];
                this.selectedNode = issueNode;
                this.selectedIssue = _.pick(issueNode, ['key', 'label', 'title', 'issueType', 'project', 'extendedFields']);
            });

        this.connectionDetails$ = this.store$.select(p => p.app.connectionDetails)
            .subscribe(cd => this.connectionDetails = cd);

        this.currentProject$ = this.store$.select(p => p.app.currentProject)
            .pipe(filter(p => p))
            .subscribe(cp => {
                this.currentProject = cp;
                this.persistenceService.setProjectDetails(cp);
            });

        this.projects$ = this.store$.select(p => p.app.projects).pipe(filter(p => p))
            .subscribe(projects => {
                this.projects = projects;
                this.allHierarchyAndEpicLinkFields = _.flatten(_.map(this.projects, 'hierarchy'));

                this.allHierarchyAndEpicLinkFields = _.union(this.allHierarchyAndEpicLinkFields,
                    _.filter(_.flatten(_.map(this.projects, 'customFields')), { name: "Epic Link" }));

                this.persistenceService.setProjects(projects);
            });

        // this.activatedRoute.queryParams.pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]))
        //     .subscribe(selected => {
        //         this.qpSelected = selected;
        //         if (this.treeNodes && this.treeNodes.length === 1) {
        //             this.selectedNode = findInTree(this.treeNodes[0], selected);
        //             this.markIssueSelected(this.selectedNode);
        //         }
        //     })

        this.activatedRoute.params.pipe(filter(p => p && p["issue"] && p["issue"].length > 0), map(p => p["issue"]))
            .subscribe(issue => {
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
        this.connectionDetails$ ? this.connectionDetails$.unsubscribe() : null;
        this.projects$ ? this.projects$.unsubscribe() : null;
        this.currentProject$ ? this.currentProject$.unsubscribe() : null;
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
            this.loadedIssue = node;

            if (this.loadedIssue.project) {
                this.loadedIssue.extendedFields = getExtendedFields(this.projects, this.loadedIssue.project.key, this.loadedIssue.issueType);
                this.hasExtendedFields = this.loadedIssue.extendedFields && this.loadedIssue.extendedFields.length > 0;
            }

            let hierarchyNode = this.createHierarchyNodes(node);
            let projectNode = this.createProjectNode(node);
            const organizationNode = this.createOrganizationNode();

            const epicNode = this.populateEpic(node);

            projectNode = this.addToLeafNode(organizationNode, projectNode);
            hierarchyNode = this.addToLeafNode(projectNode, hierarchyNode);
            node = this.addToLeafNode(hierarchyNode, epicNode);

            this.store$.dispatch(new SetHierarchicalIssueAction(node));
        }
    }

    public loadNode(event) {
        if (event.node.issueType === CustomNodeTypes.EpicChildren && (!event.node.children || event.node.children.length === 0)) {
            this.loadEpicChildren(event.node, event.node.parentId, true);
        }
    }

    private loadEpicChildren(node: any, epicKey, shouldExpand) {
        this.jiraService.executeJql(`'epic Link'=${epicKey}`, [], 'epic-children.json')
            .subscribe((data: any) => {
                if (data && data.issues) {
                    node.children = _.map(data.issues, (item) => transformParentNode(item, null));;
                    this.issueLookup = _.union(this.issueLookup, _.map(node.children, 'key'))
                    node.expanded = shouldExpand;
                }
            });
    }

    public nodeSelected(event) {
        this.router.navigate(['selected', event.node.key, 'purpose'], { relativeTo: this.activatedRoute });
    }

    private initializeMasterMenulist() {
        this.masterMenulist = [
            {
                label: 'Browse', icon: 'fa fa-external-link-alt', menuType: CustomNodeTypes.Issue,
                command: (args) => (args.item && args.item.data) ? this.router.navigate(['/for', args.item.data.key]) : null
            },
            {
                label: 'Configure', icon: 'far fa-sun', menuType: CustomNodeTypes.Organization,
                command: () => this.store$.dispatch(new ManageOrganizationEditorVisibilityAction(true))
            },
            {
                label: 'Configure', icon: 'far fa-sun', menuType: CustomNodeTypes.Hierarchy,
                command: () => this.store$.dispatch(new ManageHierarchyEditorVisibilityAction(true))
            },
            {
                label: 'Configure', icon: 'far fa-sun', menuType: CustomNodeTypes.Project,
                command: (args) => {
                    if (args.item && args.item.data) {
                        this.currentProject = _.find(this.projects, { key: args.item.data.key });
                        this.showProjectConfigSetup = true;
                    }
                }
            }
        ];
    }

    nodeContextMenuSelect(treeNode, contextMenu) {
        this.menulist = null;
        if (treeNode) {
            switch (treeNode.menuType) {
                case CustomNodeTypes.Organization:
                case CustomNodeTypes.Hierarchy:
                case CustomNodeTypes.Project:
                    this.menulist = _.filter(this.masterMenulist, { menuType: treeNode.menuType });
                    break;
                default:
                    this.menulist = _.filter(this.masterMenulist, { menuType: CustomNodeTypes.Issue });
                    break;
            }

            if (treeNode.key.toLowerCase() === this.issueKey.toLowerCase() || isCustomNode(treeNode)) {
                contextMenu.hide();
            } else if (this.menulist && this.menulist.length > 0) {
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
            if (this.relatedEpic) {

                const epicChildrenNode = createEpicChildrenNode(node);
                epicChildrenNode.children = this.loadEpicChildren(epicChildrenNode, this.relatedEpic.key, false);
                return {
                    key: this.relatedEpic.key,
                    label: this.relatedEpic.label,
                    title: this.relatedEpic.title,
                    description: this.relatedEpic.description,
                    issueType: CustomNodeTypes.Epic,
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
                        key: extendedValue, title: extendedValue, label: extendedValue, description: '',
                        icon: getIcon(CustomNodeTypes.Hierarchy),
                        issueType: hf.name, hfKey: hf.id,
                        children: [], expanded: true, editable: true, isHierarchyField: true, selectable: false, type: "Heading",
                        menuType: CustomNodeTypes.Hierarchy
                    };

                    const details: any = this.persistenceService.getHierarchyFieldDetails(hf.id, extendedNode.key);
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
                type: "Heading",
                description: node.project.description,
                issueType: CustomNodeTypes.Project,
                menuType: CustomNodeTypes.Project,
                icon: getIcon(CustomNodeTypes.Project),
                expanded: true,
                selectable: false
            };

            const projectDetails: any = this.persistenceService.getProjectDetails(node.key);
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
        this.organizationDetails = this.persistenceService.getOrganizationDetails();
        if (this.organizationDetails) {
            return {
                key: this.organizationDetails.name,
                title: this.organizationDetails.name,
                label: this.organizationDetails.name,
                description: this.organizationDetails.purpose,
                type: "Heading",
                menuType: CustomNodeTypes.Organization,
                issueType: CustomNodeTypes.Organization,
                icon: getIcon(CustomNodeTypes.Organization),
                expanded: true,
                editable: true,
                selectable: false
            }
        }
        return null;
    }

    projectConfigSetupCompleted(reload) {
        this.showProjectConfigSetup = false;
        if (reload) {
            window.location.reload();
        }
    }

    getIssueTitle = (node) => isCustomNode(node)
        ? node.title
        : `[${node.issueType}] ${node.linkType || ''} ${node.key} | ${node.title}`;

    getHeaderTitle = (node) => `[${node.issueType}] ${node.title}`;
    checkIfCustomNode = (node) => isCustomNode(node)

    // configureFields(issueType) {
    //     this.store$.dispatch(new ShowCustomFieldEditorAction(issueType));
    // }

    // onPurposeNodeEdit(args) {
    //     if (args) {
    //         switch (args.issueType) {
    //             case CustomNodeTypes.Hierarchy:
    //                 this.initiativeToEdit = args;
    //                 this.showInitiativeSetup = true;
    //                 break;
    //         }
    //     }
    // }

    // private markIssueSelected(node: any) {
    //     if (node) {
    //         if (this.projects && node.project) {
    //             getExtendedFields(this.projects, node);
    //             this.hasExtendedFields = node.extendedFields && node.extendedFields.length > 0;
    //         }
    //         if (node.parent && node.parent.issueType === CustomNodeTypes.RelatedLink && (!node.description || node.description.length === 0)) {
    //             const fieldList = _.map(node.extendedFields, 'id');
    //             this.jiraService.getIssueDetails(node.key, fieldList)
    //                 .pipe(filter(p => p !== null && p !== undefined))
    //                 .subscribe((linkedIssue: any) => {
    //                     const loaded = populateFieldValues(linkedIssue);
    //                     if (loaded) {
    //                         copyFieldValues(loaded, node);
    //                     }

    //                     node.extendedFields = _.map(node.extendedFields, (ef) => {
    //                         ef.value = linkedIssue.fields[ef.id];
    //                         return ef;
    //                     });
    //                     this.markIssueSelectedHelper(node);
    //                 });
    //         } else {
    //             this.markIssueSelectedHelper(node);
    //         }
    //     }
    // }

    // private markIssueSelectedHelper(node: any) {
    //     this.selectedIssue = _.pick(node, ['key', 'label', 'title', 'issueType', 'project', 'extendedFields']);
    //     this.expandPurpose(node);
    //     this.store$.dispatch(new SetRecentlyViewedAction(this.selectedIssue));
    // }

    // public expandPurpose(node: any) {
    //     this.purpose = [];
    //     this.populatePurpose(node);
    //     _.reverse(this.purpose);
    //     this.store$.dispatch(new SetPurposeAction(this.purpose));
    // }

    // public populatePurpose(node) {
    //     if (node) {
    //         if (node.issueType !== CustomNodeTypes.EpicChildren && node.issueType !== CustomNodeTypes.RelatedLink) {
    //             this.purpose.push({
    //                 key: node.key, issueType: node.issueType, title: node.title, purpose: node.description,
    //                 editable: node.editable, hfKey: node.hfKey
    //             });
    //         }
    //         if (node.parent) {
    //             this.populatePurpose(node.parent);
    //         }
    //     }
    // }

    // private getExtendedFields(issue) {
    //     const projectConfig = _.find(this.projects, { key: issue.project.key });
    //     if (projectConfig && projectConfig.standardIssueTypes) {
    //         const issueType = _.find(projectConfig.standardIssueTypes, { name: issue.issueType });
    //         if (issueType) {
    //             issue.extendedFields = issueType.list || [];
    //             this.hasExtendedFields = issue.extendedFields && issue.extendedFields.length > 0;
    //         }
    //     }
    // }

}
