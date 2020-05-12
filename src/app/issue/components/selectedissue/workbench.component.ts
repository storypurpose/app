import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { filter, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CustomNodeTypes } from 'src/app/lib/jira-tree-utils';

const LEFT_PANE_WIDTH = 55;

@Component({
    selector: 'app-workbench',
    templateUrl: './workbench.component.html'
})
export class WorkbenchComponent implements AfterViewInit, OnInit, OnDestroy {
    selectedIssue$: Subscription;
    public issue: any;
    selectedIssue: any;

    allRelatedIssuesVisible = true;
    groupedRelatedLinks: any;

    allEpicChildrenVisible = true;
    groupedEpicChildren: any;

    epicChildrenLoaded$: Subscription;

    contentHeight = 0;
    @ViewChild('content') elementView: ElementRef;

    selectedTab = 1;
    localNodeType: any;
    selectedRelatedIssue: any;
    selectedEpicIssue: any;

    constructor(public cdRef: ChangeDetectorRef, public store$: Store<AppState>) {
        this.localNodeType = CustomNodeTypes;
    }

    ngOnInit(): void {
        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue).pipe(filter(p => p))
            .subscribe(issue => {
                this.selectedRelatedIssue = null;
                this.selectedEpicIssue = null;

                this.issue = issue;
                this.groupedRelatedLinks = this.groupChildren(this.issue.relatedLinks, 'linkType');
                this.issue.relatedLinksCount = this.groupedRelatedLinks.length;
                this.selectedTab = (this.groupedRelatedLinks.length > 0) ? 2 : 3;
                this.toggleAllRelatedIssues();
                if (this.issue.issueType === CustomNodeTypes.Epic) {
                    this.groupEpicChildren('status');
                }
            });
    }

    ngOnDestroy(): void {
        this.epicChildrenLoaded$ ? this.epicChildrenLoaded$.unsubscribe() : null;
        this.selectedIssue$ ? this.selectedIssue$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - 134;
        this.cdRef.detectChanges();
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
        this.selectedRelatedIssue.project = this.issue.project;
    }

    resetSelectedEpicIssue = () => this.selectedEpicIssue = null;
    selectEpicIssue(ri) {
        this.selectedEpicIssue = ri;
        this.selectedEpicIssue.project = this.issue.project;
    }

    groupEpicChildren(groupByField): void {
        this.selectedTab = 1;
        if (this.issue && !this.groupedEpicChildren) {
            const epicChildren = this.issue.epicChildren;
            if (epicChildren && epicChildren.length > 0) {
                this.groupedEpicChildren = this.groupChildren(epicChildren, groupByField);
            }
            this.toggleAllEpicChildren()
        }
    }

    private groupChildren(children: any, groupByField: any) {
        const grouped = _.groupBy(children, groupByField);
        return Object.keys(grouped).map(key => {
            return { label: key, total: grouped[key].length, children: grouped[key] };
        });
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
}
