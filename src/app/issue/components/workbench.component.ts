import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { filter } from 'rxjs/operators';
import { Subscription, combineLatest } from 'rxjs';
import { CustomNodeTypes } from 'src/app/lib/jira-tree-utils';

@Component({
    selector: 'app-workbench',
    templateUrl: './workbench.component.html'
})
export class WorkbenchComponent implements AfterViewInit, OnInit, OnDestroy {
    public issue: any;

    allRelatedIssuesVisible = false;
    allEpicChildrenVisible = false;
    groupedEpicChildren: any;
    epicChildrenLoadedQuery$: Subscription;

    combined$: Subscription;

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


        const issueQuery = this.store$.select(p => p.issue.selectedItem).pipe(filter(p => p));
        const epicChildrenLoadedQuery = this.store$.select(p => p.app.epicChildrenLoaded).pipe(filter(issue => issue === true));

        this.combined$ = combineLatest(issueQuery, epicChildrenLoadedQuery)
            .subscribe(([issue]) => {
                this.issue = issue;
                const relatedLinks = _.filter(this.issue.children, { issueType: CustomNodeTypes.RelatedLink });
                this.issue.hasRelatedLinks = relatedLinks && relatedLinks.length > 0;
                this.selectedTab = this.issue.hasRelatedLinks ? 2 : 3;

                if (this.issue.issueType === CustomNodeTypes.Epic) {
                    this.groupEpicChildren('status');
                }
            });
    }

    toggleAllRelatedIssues() {
        this.allRelatedIssuesVisible = !this.allRelatedIssuesVisible;
        if (this.issue && this.issue.hasRelatedLinks) {
            _.filter(this.issue.children, { issueType: CustomNodeTypes.RelatedLink })
                .forEach(u => u.visible = this.allRelatedIssuesVisible);
        }
    }

    ngOnDestroy(): void {
        this.epicChildrenLoadedQuery$ ? this.epicChildrenLoadedQuery$.unsubscribe() : null;
        this.combined$ ? this.combined$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - 134;
        this.cdRef.detectChanges();
    }

    leftPaneSize = 60;
    public columns: any = [{ visible: true, size: 60 }, { visible: true, size: 40 }];
    dragEnd(e: { gutterNum: number; sizes: Array<number> }) {
        this.adjustPaneSize(e.sizes[0]);
    }
    public adjustPaneSize(sizeOfLeftPane) {
        this.leftPaneSize = sizeOfLeftPane;
        this.columns[0].size = sizeOfLeftPane;
        this.columns[1].size = 100 - sizeOfLeftPane;
    }
    toggleFullscreen() {
        this.adjustPaneSize(this.leftPaneSize === 0 ? 60 : 0);
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
            const epicChildren = _.find(this.issue.children, { issueType: CustomNodeTypes.EpicChildren });
            if (epicChildren && epicChildren.children && epicChildren.children.length > 0) {
                this.groupedEpicChildren = this.groupChildren(epicChildren.children, groupByField);
            }
        }
    }

    private groupChildren(children: any, groupByField: any) {
        const grouped = _.groupBy(children, groupByField);
        return Object.keys(grouped).map(key => {
            return { label: key, total: grouped[key].length, children: grouped[key] };
        });
    }

    toggleAllEpicChildren() {
        this.allEpicChildrenVisible = !this.allEpicChildrenVisible;
        if (this.groupedEpicChildren) {
            this.groupedEpicChildren.forEach(u => u.visible = this.allEpicChildrenVisible);
        }
    }
}