import { Component, Input, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
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
    combined$: Subscription;
    contentHeight = 0;
    @ViewChild('content') elementView: ElementRef;

    selectedTab = 1;
    localNodeType: any;
    relatedIssue: any;

    constructor(public cdRef: ChangeDetectorRef, public store$: Store<AppState>) {
        this.localNodeType = CustomNodeTypes;
    }

    ngOnInit(): void {
        const issueQuery = this.store$.select(p => p.purpose.selectedItem).pipe(filter(p => p));
        const projectsQuery = this.store$.select(p => p.app.projects);
        this.combined$ = combineLatest(issueQuery, projectsQuery)
            .subscribe(([issue, projects]) => {
                this.issue = issue;
                const relatedLinks = _.filter(this.issue.children, { issueType: CustomNodeTypes.RelatedLink });
                this.issue.hasRelatedLinks = relatedLinks && relatedLinks.length > 0;
                this.selectedTab = this.issue.hasRelatedLinks ? 1 : 2;
                this.issue.project = _.find(projects, { key: this.issue.project.key })
            });
    }

    ngOnDestroy(): void {
        this.combined$ ? this.combined$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - 134;
        this.cdRef.detectChanges();
    }

    selectRelatedIssue(ri) {
        this.relatedIssue = ri;
        this.relatedIssue.project = this.issue.project;
    }
}
