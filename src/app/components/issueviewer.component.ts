import { Component, OnInit, IterableDiffers, OnDestroy } from '@angular/core';
import { JiraService } from '../lib/jira.service';
import {
    transformParentNode, flattenAndTransformNodes, populateFieldValues,
    findInTree, CustomNodeTypes, isCustomNode, getExtendedFieldValue, getIcon
} from '../lib/tree-utils';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { PersistenceService } from '../lib/persistence.service';
import { Store } from '@ngrx/store';
import { SetPurposeAction, SetSetRecentlyViewedAction } from '../purpose/+state/purpose.actions';
import { AppState } from '../+state/app.state';
import { SetCurrentIssueKeyAction, ShowCustomFieldEditorAction } from '../+state/app.actions';
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
    public zoom = 100;

    public selectedIssue: any;
    public loadedIssue: any;
    public showDetails = false;
    public includeHierarchy = false;
    public issueKey = "storypurpose";
    public contextIssueKey = "";
    public mappedEpicFieldCode: string;
    public mappedHierarchyFields: any;
    public mappedIssuetypeFields: string;
    public relatedEpic: any;
    public organizationDetails: any;

    public purpose = [];
    public menulist: any;
    public connectionDetails: any;
    public hasExtendedFields = false;

    connectionDetailsSubscription: Subscription;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public jiraService: JiraService,
        public persistenceService: PersistenceService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.includeHierarchy = true;
        this.initiatize();
    }
    ngOnDestroy(): void {
        this.connectionDetailsSubscription ? this.connectionDetailsSubscription.unsubscribe() : null;
    }

    public initiatize(): void {
        this.connectionDetailsSubscription = this.store$.select(p => p.app.connectionDetails)
            .subscribe(p => this.connectionDetails = p);
        //this.connectionDetails = this.persistenceService.get1ConnectionDetails();
        this.menulist = [{
            label: 'Browse', icon: 'fa fa-external-link-alt', command: () => {
                if (this.contextIssueKey !== "") {
                    this.router.navigate(['/for', this.contextIssueKey]);
                } else {
                    //this.messageService.push("Failed to identify node");
                }
            }
        }]

        this.activatedRoute.params.pipe(
            filter(p => p && p["issue"] && p["issue"].length > 0),
            map(p => p["issue"])
        ).subscribe(issue => {
            this.store$.dispatch(new SetCurrentIssueKeyAction(issue));

            this.issueKey = issue;
            const extendedFields = this.getExtendedFields();
            this.jiraService.getIssueDetails(issue, extendedFields)
                .pipe(filter((p: any) => p !== null && p !== undefined && p.fields))
                .subscribe((issuedetails: any) => {
                    this.relatedEpic = null;
                    let epicKey = (this.mappedEpicFieldCode !== '') ? issuedetails.fields[this.mappedEpicFieldCode] : ''

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

    public onIssueLoaded(issue) {
        this.result = issue;
        this.showDetails = false;
        if (this.result) {
            let node = transformParentNode(this.result);
            this.loadedIssue = node;
            this.checkIssueHasExtendedFields(this.loadedIssue);
            if (this.includeHierarchy) {

                let hierarchyNode = this.createHierarchyNodes(node);
                let projectNode = this.createProjectNode(node);
                const organizationNode = this.createOrganizationNode();

                const epicNode = this.populateEpic(node);

                projectNode = this.addToLeafNode(organizationNode, projectNode);
                hierarchyNode = this.addToLeafNode(projectNode, hierarchyNode);
                node = this.addToLeafNode(hierarchyNode, epicNode);
            }
            this.treeNodes = [node];

            const issueToMarkSelected = findInTree(node, this.result.key);
            if (issueToMarkSelected) {
                this.markIssueSelected(issueToMarkSelected);
            }
        }
    }

    private getExtendedFields() {
        const mappedFields = this.persistenceService.getFieldMapping();
        const extendedFields = [];
        this.mappedIssuetypeFields = mappedFields.issueTypes || [];
        mappedFields.issueTypes.forEach(mf => {
            _.merge(extendedFields, _.map(mf.list, 'code'));
        });
        this.mappedHierarchyFields = '';
        if (mappedFields && mappedFields.hierarchy && mappedFields.hierarchy.support === true) {
            this.mappedHierarchyFields = mappedFields.hierarchy.list || [];
            this.mappedHierarchyFields.forEach(hf => extendedFields.push(hf.code));
        }

        this.mappedEpicFieldCode = '';
        if (mappedFields && mappedFields.epicLink && mappedFields.epicLink.support === true && mappedFields.epicLink.code !== '') {
            this.mappedEpicFieldCode = mappedFields.epicLink.code;
            extendedFields.push(this.mappedEpicFieldCode);
        }
        return extendedFields;
    }

    public loadNode(event) {
        if (event.node.issueType === "epic-children") {
            this.jiraService.executeJql(`'epic Link'=${event.node.parentId}`, [], 'epic-children.json')
                .subscribe((data: any) => {
                    if (data && data.issues) {
                        const list = flattenAndTransformNodes(data.issues);
                        event.node.children = list;
                        event.node.expanded = true;
                    }
                });
        }
    }

    public nodeSelected(event) {
        this.markIssueSelected(event.node);
    }
    nodeContextMenuSelect(args, contextMenu) {
        if (args && (args.key.toLowerCase() === this.issueKey.toLowerCase() || isCustomNode(args) === true)) {
            this.contextIssueKey = "";
            contextMenu.hide();
        } else if (args.isHierarchyField === true) {
            // TODO: Handle custom menu
            this.contextIssueKey = "";
            contextMenu.hide();
        } else {
            this.contextIssueKey = args.key;
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
        this.expandPurpose(node);

        this.selectedIssue = { key: node.key, label: node.label, title: node.title, issueType: node.issueType };

        if (this.mappedIssuetypeFields) {
            const issueTypeFields: any = _.find(this.mappedIssuetypeFields, { name: node.issueType });
            if (issueTypeFields && issueTypeFields.list) {
                this.selectedIssue.extendedFields = _.map(issueTypeFields.list, (itf) => {
                    return { name: itf.name, value: node.fields[itf.code] }
                })
            }
        }
        this.store$.dispatch(new SetSetRecentlyViewedAction(this.selectedIssue));
    }

    canTrackProgress = (node) => (node && (node.issueType === CustomNodeTypes.TestSuite || node.issueType === CustomNodeTypes.Story));

    checkIssueHasExtendedFields = (node) => {
        if (this.mappedIssuetypeFields && this.mappedIssuetypeFields.length > 0) {
            const found = _.find(this.mappedIssuetypeFields, { name: node.issueType });
            if (found) {
                this.hasExtendedFields = true;
            }
        }
    }
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
                    children: [node],
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
                        children: [], expanded: true, editable: true, isHierarchyField: true, selectable: false
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
                description: node.project.description,
                issueType: CustomNodeTypes.Project,
                icon: getIcon(CustomNodeTypes.Project),
                expanded: true,
                selectable: false
            };

            const projectDetails: any = this.persistenceService.getProjectDetails(node.key);

            if (projectDetails) {
                node.description = projectDetails.description;
            }
            else {
                this.jiraService.getProjectDetails(node.key)
                    .pipe(filter(p => p !== null && p !== undefined), map((p: any) => {
                        return {
                            key: p.key,
                            name: p.name,
                            description: p.description
                        };
                    }))
                    .subscribe((projectDetails: any) => {
                        this.persistenceService.setProjectDetails(projectDetails);
                        node.description = projectDetails.description;
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
                issueType: CustomNodeTypes.Organization,
                icon: getIcon(CustomNodeTypes.Organization),
                expanded: true,
                editable: true
            }
        }
        return null;
    }

    public populatePurpose(node) {
        if (node) {
            if (node.issueType !== 'epic-children' && node.issueType !== CustomNodeTypes.RelatedLink) {
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
}
