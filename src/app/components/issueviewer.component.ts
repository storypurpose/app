import { Component, OnInit, OnDestroy } from '@angular/core';
import { JiraService } from '../lib/jira.service';
import {
    transformParentNode, populateFieldValues,
    findInTree, CustomNodeTypes, isCustomNode, getExtendedFieldValue, getIcon, copyFieldValues, createEpicChildrenNode
} from '../lib/jira-tree-utils';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { PersistenceService } from '../lib/persistence.service';
import { Store } from '@ngrx/store';
import { SetPurposeAction, SetRecentlyViewedAction, ManageOrganizationEditorVisibilityAction, ManageHierarchyEditorVisibilityAction } from '../purpose/+state/purpose.actions';
import { AppState } from '../+state/app.state';
import { SetCurrentIssueKeyAction, ShowCustomFieldEditorAction, UpsertProjectAction } from '../+state/app.actions';
import { Subscription } from 'rxjs';

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
    public selectedNode: any;
    public qpSelected: string;
    public zoom = 100;

    public selectedIssue: any;
    public loadedIssue: any;
    public showDetails = false;
    public issueKey = "storypurpose";
    public contextIssueKey = "";
    public mappedEpicLinkFieldCode: string;
    public mappedHierarchyFields: any;
    public relatedEpic: any;
    public organizationDetails: any;

    public purpose = [];
    public menulist: any;
    public masterMenulist: any;
    public hasExtendedFields = false;

    public connectionDetails: any;
    connectionDetailsSubscription: Subscription;

    public projects: any;
    projectsSubscription: Subscription;
    showProjectConfigSetup = false;
    currentProject: any;
    currentProjectSubscription: Subscription;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public jiraService: JiraService,
        public persistenceService: PersistenceService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {

        this.masterMenulist = [
            {
                label: 'Browse', icon: 'fa fa-external-link-alt', menuType: CustomNodeTypes.Issue,
                command: () => (this.contextIssueKey !== "") ? this.router.navigate(['/for', this.contextIssueKey]) : null
            },
            {
                label: 'Configure', icon: 'far fa-sun', menuType: CustomNodeTypes.Project,
                command: () => {
                    this.currentProject = _.find(this.projects, { key: this.selectedIssue.project.key });
                    this.showProjectConfigSetup = true;
                }
            },
            {
                label: 'Configure', icon: 'far fa-sun', menuType: CustomNodeTypes.Organization,
                command: () => {
                    this.store$.dispatch(new ManageOrganizationEditorVisibilityAction(true));
                }
            },
            {
                label: 'Configure', icon: 'far fa-sun', menuType: CustomNodeTypes.Hierarchy,
                command: () => {
                    this.store$.dispatch(new ManageHierarchyEditorVisibilityAction(true));
                }
            }]

        this.connectionDetailsSubscription = this.store$.select(p => p.app.connectionDetails)
            .subscribe(cd => this.connectionDetails = cd);

        this.currentProjectSubscription = this.store$.select(p => p.app.currentProject)
            .pipe(filter(p => p))
            .subscribe(cp => {
                this.currentProject = cp;
                this.persistenceService.setProjectDetails(cp);
            });

        this.projectsSubscription = this.store$.select(p => p.app.projects).pipe(filter(p => p))
            .subscribe(projects => {
                this.projects = projects;
                this.persistenceService.setProjects(projects);
            });

        this.activatedRoute.queryParams.pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]))
            .subscribe(selected => {
                this.qpSelected = selected;
                if (this.treeNodes && this.treeNodes.length === 1) {
                    this.selectedNode = findInTree(this.treeNodes[0], selected);
                    this.markIssueSelected(this.selectedNode);
                }
            })

        this.activatedRoute.params.pipe(filter(p => p && p["issue"] && p["issue"].length > 0), map(p => p["issue"]))
            .subscribe(issue => {
                this.store$.dispatch(new SetCurrentIssueKeyAction(issue));
                this.issueKey = issue;
                this.jiraService.getIssueDetails(issue, [])
                    .pipe(filter((p: any) => p !== null && p !== undefined && p.fields))
                    .subscribe((issuedetails: any) => {
                        this.relatedEpic = null;
                        this.mappedEpicLinkFieldCode = this.getEpicLinkFieldCode(issuedetails.fields.project);
                        let epicKey = (this.mappedEpicLinkFieldCode !== '') ? issuedetails.fields[this.mappedEpicLinkFieldCode] : ''

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
        this.connectionDetailsSubscription ? this.connectionDetailsSubscription.unsubscribe() : null;
        this.projectsSubscription ? this.projectsSubscription.unsubscribe() : null;
    }

    public getEpicLinkFieldCode(project) {
        if (this.projects && project) {
            const projectFound = _.find(this.projects, { key: project.key });
            if (projectFound) {
                const customFieldFound = _.find(projectFound.customFields, { name: "Epic Link" });
                if (customFieldFound) {
                    return customFieldFound.id;
                }
            }
        }
        return null;
    }
    public onIssueLoaded(issue) {
        this.result = issue;
        this.showDetails = false;
        if (this.result) {
            let node = transformParentNode(this.result, true);
            this.loadedIssue = node;

            if (this.loadedIssue.project) {
                this.getExtendedFields(this.loadedIssue);
            }

            let hierarchyNode = this.createHierarchyNodes(node);
            let projectNode = this.createProjectNode(node);
            const organizationNode = this.createOrganizationNode();

            const epicNode = this.populateEpic(node);

            projectNode = this.addToLeafNode(organizationNode, projectNode);
            hierarchyNode = this.addToLeafNode(projectNode, hierarchyNode);
            node = this.addToLeafNode(hierarchyNode, epicNode);

            this.treeNodes = [node];

            if (!this.qpSelected) {
                this.router.navigate([], { queryParams: { selected: this.loadedIssue.key } });
            } else if (!this.selectedNode || this.selectedNode.key !== this.qpSelected) {
                this.selectedNode = findInTree(this.treeNodes[0], this.qpSelected);
                setTimeout(() => this.markIssueSelected(this.selectedNode), 1500);
            }
        }
    }

    private getExtendedFields(issue) {
        const projectConfig = _.find(this.projects, { key: issue.project.key });
        if (projectConfig && projectConfig.standardIssueTypes) {
            const issueType = _.find(projectConfig.standardIssueTypes, { name: issue.issueType });
            if (issueType) {
                issue.extendedFields = issueType.list || [];
                this.hasExtendedFields = issue.extendedFields && issue.extendedFields.length > 0;
            }
        }
    }

    public loadNode(event) {
        if (event.node.issueType === CustomNodeTypes.EpicChildren && (!event.node.children || event.node.children.length === 0)) {
            this.loadEpicChildren(event.node, event.node.parentId);
        }
    }

    private loadEpicChildren(node: any, epicKey) {
        this.jiraService.executeJql(`'epic Link'=${epicKey}`, [], 'epic-children.json')
            .subscribe((data: any) => {
                if (data && data.issues) {
                    node.children = _.map(data.issues, (item) => transformParentNode(item, false));;
                    node.expanded = true;
                }
            });
    }

    public nodeSelected(event) {
        this.router.navigate([], { queryParams: { selected: event.node.key } });
    }
    nodeContextMenuSelect(args, contextMenu) {
        this.menulist = null;
        if (args) {
            switch (args.issueType) {
                case CustomNodeTypes.Organization:
                    this.menulist = _.filter(this.masterMenulist, { menuType: CustomNodeTypes.Organization });
                    break;
                case CustomNodeTypes.Hierarchy:
                    this.menulist = _.filter(this.masterMenulist, { menuType: CustomNodeTypes.Hierarchy });
                    break;
                case CustomNodeTypes.Project:
                    this.menulist = _.filter(this.masterMenulist, { menuType: CustomNodeTypes.Project });
                    break;
                default:
                    this.menulist = _.filter(this.masterMenulist, { menuType: CustomNodeTypes.Issue });

                    if (args.key.toLowerCase() === this.issueKey.toLowerCase() || isCustomNode(args) === true) {
                        this.contextIssueKey = "";
                        contextMenu.hide();
                    } else {
                        this.contextIssueKey = args.key;
                    }

                    break;
            }
        }

    }
    onPurposeNodeEdit(args) {
        if (args) {
            switch (args.issueType) {
                case CustomNodeTypes.Hierarchy:
                    this.initiativeToEdit = args;
                    this.showInitiativeSetup = true;
                    break;
            }
        }
    }

    private markIssueSelected(node: any) {
        if (node) {
            if (this.projects && node.project) {
                this.getExtendedFields(node);
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
                        this.markIssueSelectedHelper(node);
                    });
            } else {
                this.markIssueSelectedHelper(node);
            }
        }
    }

    private markIssueSelectedHelper(node: any) {
        this.selectedIssue = _.pick(node, ['key', 'label', 'title', 'issueType', 'project', 'extendedFields']);
        this.expandPurpose(node);
        this.store$.dispatch(new SetRecentlyViewedAction(this.selectedIssue));
    }

    canTrackProgress = (node) => (node && (node.issueType === CustomNodeTypes.TestSuite || node.issueType === CustomNodeTypes.Story));

    public expandPurpose(node: any) {
        this.purpose = [];
        this.populatePurpose(node);
        _.reverse(this.purpose);
        this.store$.dispatch(new SetPurposeAction(this.purpose));
    }

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
                return {
                    key: this.relatedEpic.key,
                    label: this.relatedEpic.label,
                    title: this.relatedEpic.title,
                    description: this.relatedEpic.description,
                    issueType: CustomNodeTypes.Epic,
                    icon: getIcon(CustomNodeTypes.Epic),
                    project: this.relatedEpic.project,
                    children: [node, createEpicChildrenNode(node)],
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
                const value = getExtendedFieldValue(node, hf.code);
                if (value.length > 0) {
                    rootNode
                    const extendedNode = {
                        key: value, title: value, label: value, description: '', icon: "fa fa-share-alt", issueType: hf.name, hfKey: hf.code,
                        children: [], expanded: true, editable: true, isHierarchyField: true, selectable: false, type: "Heading",
                    };

                    const details: any = this.persistenceService.getHierarchyFieldDetails(hf.code, extendedNode.key);
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
                issueType: CustomNodeTypes.Organization,
                icon: getIcon(CustomNodeTypes.Organization),
                expanded: true,
                editable: true,
                selectable: false
            }
        }
        return null;
    }

    public populatePurpose(node) {
        if (node) {
            if (node.issueType !== CustomNodeTypes.EpicChildren && node.issueType !== CustomNodeTypes.RelatedLink) {
                this.purpose.push({
                    key: node.key, issueType: node.issueType, title: node.title, purpose: node.description,
                    editable: node.editable, hfKey: node.hfKey
                });
            }
            if (node.parent) {
                this.populatePurpose(node.parent);
            }
        }
    }

    configureFields(issueType) {
        this.store$.dispatch(new ShowCustomFieldEditorAction(issueType));
    }

    projectConfigSetupCompleted(reload) {
        this.showProjectConfigSetup = false;
        if (reload) {
            window.location.reload();
        }
    }

    getPrintableTitle(node) {
        return isCustomNode(node) ? node.title : `${node.key} ${node.title}`
    }

    checkIfCustomNode = (node) => isCustomNode(node)
}
