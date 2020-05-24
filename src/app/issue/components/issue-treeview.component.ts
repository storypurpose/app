import { Component, Input } from '@angular/core';
import * as _ from "lodash";
import { TreeTemplateTypes, isCustomNode } from 'src/app/lib/jira-tree-utils';
import { getRoutelet } from 'src/app/lib/route-utils';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-issue-treeview',
    templateUrl: './issue-treeview.component.html'
})
export class IssueTreeviewComponent {
    @Input() issueKey: string;
    @Input() rootNode: any;
    selectedNode: any;

    constructor(public router: Router, public activatedRoute: ActivatedRoute) {

    }
    nodeSelected(event) {
        if (event.node.editable) {
            event.node.memento = { type: event.node.type, selectable: event.node.selectable };
            event.node.type = TreeTemplateTypes.Editing;
            event.node.selectable = false;
        }
        else {
            let routelet = getRoutelet(this.router, 'details');
            this.router.navigate(['../..', event.node.key, routelet], { relativeTo: this.activatedRoute });
        }
    }

    getIssueTitle = (node) =>
        isCustomNode(node) ? node.title : `[${node.issueType}] ${node.linkType || ''} ${node.key} | ${node.title}`;

    getHeaderTitle = (node) => `[${node.issueType}] ${node.title}`;

    checkIfCustomNode = (node) => isCustomNode(node);

    // cancelNodeEditingOnEscape = (eventArgs, node) => {
    //     eventArgs.stopPropagation();
    //     eventArgs.preventDefault();
    //     this.cancelNodeEditing(node);
    // }

    // public cancelNodeEditing(node) {
    //     if (node.memento) {
    //         node.title = '';
    //         node.type = node.memento.type;
    //         setTimeout(() => node.selectable = node.memento.selectable, 200);
    //     }
    // }

    // public canUpdateTitle = (node) => node && node.title && node.title.trim().length > 0;

    // updateNodeTitleOnEnter = (eventArgs, node) => {
    //     eventArgs.stopPropagation();
    //     eventArgs.preventDefault();
    //     this.updateNodeTitle(node);
    // }
    // public updateNodeTitle(node) {
    //     if (node.title && node.title.length > 0) {
    //         node.type = TreeTemplateTypes.Heading;
    //         node.selectable = false;
    //         node.key = node.title;
    //         const payload = { name: node.title };
    //         this.store$.dispatch(new UpdateOrganizationTitleAction(payload));
    //     }
    // }
}