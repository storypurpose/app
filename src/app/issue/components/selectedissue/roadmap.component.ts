import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, populatedFieldList } from 'src/app/lib/jira-tree-utils';
import { filter } from 'rxjs/operators';
import { IssueState } from '../../+state/issue.state';
import { initRoadmapMetadata } from 'src/app/lib/roadmap-utils';

@Component({
    selector: 'app-roadmap',
    templateUrl: './roadmap.component.html'
})

export class RoadmapComponent implements OnInit, OnDestroy {

    roadmap: any;
    timespan: any;

    selectedStatuses: any = [];
    statusLookup = [];

    includeRelatedIssues = false;
    relatedIssuesIncluded = false;

    includeEpicChildren = false;
    epicChildrenIncluded = false;

    showStatistics = false;

    selectedIssue$: Subscription;
    selectedItem: any;

    contentHeight = 0;
    @ViewChild('content') elementView: ElementRef;

    constructor(public cdRef: ChangeDetectorRef, public store$: Store<IssueState>) { }

    ngOnInit(): void {
        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue)
            .pipe(filter(p => p))
            .subscribe(selectedIssue => {
                this.roadmap = _.pick(selectedIssue, _.union(populatedFieldList, ['relatedLinks', 'epicChildren']));

                if (selectedIssue.issueType === CustomNodeTypes.Epic) {
                    this.includeEpicChildren = true;
                } else {
                    this.includeRelatedIssues = true;
                }
                this.plotIssuesOnRoadmap()

                console.log(this.roadmap);
            })
    }

    ngOnDestroy(): void {
        this.selectedIssue$ ? this.selectedIssue$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - 180;
        this.cdRef.detectChanges();
    }

    plotIssuesOnRoadmap() {
        this.roadmap.metadata = initRoadmapMetadata();
        this.roadmap.data = [
            {
                data: { title: this.roadmap.title },
                children: _.map(this.roadmap.epicChildren, (ec) => {
                    return { data: { title: ec.title } }
                }),
                leaf: false,
                expanded: true

            },
            {
                data: { title: 'Related stories' },
                children: _.map(this.roadmap.relatedLinks, (ec) => {
                    return { data: { title: ec.title } }
                }),
                leaf: false,
                expanded: true
            },
        ]
    }
}
