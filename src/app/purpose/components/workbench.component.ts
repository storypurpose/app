import { Component, Input, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { filter } from 'rxjs/operators';
import { Subscription, combineLatest } from 'rxjs';
import { CustomNodeTypes, fieldList } from 'src/app/lib/jira-tree-utils';

@Component({
    selector: 'app-workbench',
    templateUrl: './workbench.component.html'
})
export class WorkbenchComponent implements AfterViewInit, OnInit, OnDestroy {
    public issue: any;

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

        this.epicChildrenLoadedQuery$ = this.store$.select(p => p.app.epicChildrenLoaded)
            .pipe(filter(issue => issue === true))
            .subscribe(p => this.groupEpicChildren('status'))

        const issueQuery = this.store$.select(p => p.purpose.selectedItem).pipe(filter(p => p));
        const projectsQuery = this.store$.select(p => p.app.projects);
        this.combined$ = combineLatest(issueQuery, projectsQuery)
            .subscribe(([issue, projects]) => {
                this.issue = issue;
                const relatedLinks = _.filter(this.issue.children, { issueType: CustomNodeTypes.RelatedLink });
                this.issue.hasRelatedLinks = relatedLinks && relatedLinks.length > 0;
                this.selectedTab = this.issue.hasRelatedLinks ? 2 : 3;
                this.issue.project = _.find(projects, { key: this.issue.project.key })

                if (this.issue.issueType === CustomNodeTypes.Epic) {
                    this.groupEpicChildren('status');
                }
            });
    }
    ngOnDestroy(): void {
        this.epicChildrenLoadedQuery$ ? this.epicChildrenLoadedQuery$.unsubscribe() : null;
        this.combined$ ? this.combined$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - 134;
        this.cdRef.detectChanges();
    }

    selectRelatedIssue(ri) {
        this.selectedRelatedIssue = ri;
        this.selectedRelatedIssue.project = this.issue.project;
    }

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
