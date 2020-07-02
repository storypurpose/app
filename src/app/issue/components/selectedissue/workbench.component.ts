import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CustomNodeTypes } from 'src/app/lib/jira-tree-utils';
import { groupChildren } from 'src/app/lib/utils';
import { UpdateFieldValueAction } from '../../+state/issue.actions';

const LEFT_PANE_WIDTH = 60;

@Component({
    selector: 'app-workbench',
    templateUrl: './workbench.component.html'
})
export class WorkbenchComponent implements OnInit, OnDestroy {
    selectedIssue$: Subscription;
    public issue: any;
    selectedIssue: any;

    allRelatedIssuesVisible = true;
    groupedRelatedLinks: any;

    allEpicChildrenVisible = true;
    groupedEpicChildren: any;

    epicChildrenLoaded$: Subscription;

    selectedTab = 1;
    localNodeType: any;
    selectedRelatedIssue: any;
    selectedEpicIssue: any;

    constructor(public store$: Store<AppState>) {
        this.localNodeType = CustomNodeTypes;
    }

    ngOnInit(): void {
        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue).pipe(filter(p => p))
            .subscribe(issue => {
                this.issue = issue;

                this.selectedRelatedIssue = null;
                this.selectedEpicIssue = null;

                if (this.issue.relatedLinksLoaded && !this.groupedRelatedLinks) {
                    this.groupedRelatedLinks = groupChildren(this.issue.relatedLinks, 'linkType');
                    this.issue.relatedLinksCount = this.groupedRelatedLinks.length;
                    this.selectedTab = (this.groupedRelatedLinks.length > 0) ? 2 : 3;
                    this.toggleAllRelatedIssues();
                }

                if (this.issue.issueType === CustomNodeTypes.Epic && this.issue.epicChildrenLoaded) {
                    this.groupEpicChildren('status');
                }
            });
    }

    ngOnDestroy(): void {
        this.epicChildrenLoaded$ ? this.epicChildrenLoaded$.unsubscribe() : null;
        this.selectedIssue$ ? this.selectedIssue$.unsubscribe() : null;
    }

    leftPaneSize = LEFT_PANE_WIDTH;
    public columns: any = [{ visible: true, size: LEFT_PANE_WIDTH }, { visible: true, size: 40 }];
    dragEnd(e: { gutterNum: number; sizes: Array<number> }) {
        this.adjustPaneSize(e.sizes[0]);
    }
    public adjustPaneSize(sizeOfLeftPane) {
        this.leftPaneSize = sizeOfLeftPane;
        this.columns[0].size = sizeOfLeftPane;
        this.columns[1].size = 100 - sizeOfLeftPane;
    }
    toggleFullscreen() {
        this.adjustPaneSize(this.leftPaneSize === 0 ? LEFT_PANE_WIDTH : 0);
    }

    resetSelectedRelatedIssue = () => this.selectedRelatedIssue = null;
    selectRelatedIssue(ri) {
        this.selectedRelatedIssue = ri;
        this.selectedRelatedIssue.projectConfig = this.issue.projectConfig;
    }

    resetSelectedEpicIssue = () => this.selectedEpicIssue = null;
    selectEpicIssue(ri) {
        this.selectedEpicIssue = ri;
        this.selectedEpicIssue.projectConfig = this.issue.projectConfig;
    }

    groupEpicChildren(groupByField): void {
        this.selectedTab = 1;
        if (this.issue && !this.groupedEpicChildren) {
            const epicChildren = this.issue.epicChildren;
            if (epicChildren && epicChildren.length > 0) {
                this.groupedEpicChildren = groupChildren(epicChildren, groupByField);
            }
            this.toggleAllEpicChildren()
        }
    }

    toggleAllEpicChildren() {
        this.selectedIssue = null;
        this.allEpicChildrenVisible = !this.allEpicChildrenVisible;
        if (this.groupedEpicChildren) {
            this.groupedEpicChildren
                .forEach(u => u.visible = this.groupedEpicChildren.length === 1 ? true : this.allEpicChildrenVisible);
        }
    }

    toggleAllRelatedIssues() {
        this.selectedIssue = null;
        this.allRelatedIssuesVisible = !this.allRelatedIssuesVisible;
        if (this.groupedRelatedLinks && this.groupedRelatedLinks.length > 0) {
            this.groupedRelatedLinks.forEach(u => u.visible = this.groupedRelatedLinks.length === 1 ? true : this.allRelatedIssuesVisible);
        }
    }

    reloadSubtasks() {
        this.selectedEpicIssue = null;
        this.selectedRelatedIssue = null;
        this.selectedIssue = this.issue;
    }

    onFieldUpdated(eventArgs) {
        this.store$.dispatch(new UpdateFieldValueAction(eventArgs));
    }

    onDescUpdated(eventArgs) {
        this.onFieldUpdated({ issueKey: this.issue.key, fieldName: 'description', updatedValue: eventArgs.updated });
        this.issue.description = eventArgs.updated;
    }
    // editDescription = false;
    // descMomento: string;
    // onEditDescription() {
    //     if (this.issue) {
    //         this.descMomento = this.issue.description;
    //         this.editDescription = true;
    //     }
    // }
    // onSaveDescription() {
    //     this.onFieldUpdated({ issueKey: this.issue.key, fieldName: 'description', updatedValue: this.descMomento });
    //     this.issue.description = this.descMomento;
    //     this.editDescription = false;
    // }
    // onCancelDescription(event) {
    //     if (event) {
    //         event.preventDefault();
    //         event.stopPropagation();
    //     }
    //     this.issue.description = this.descMomento;
    //     this.editDescription = false;
    // }
}

