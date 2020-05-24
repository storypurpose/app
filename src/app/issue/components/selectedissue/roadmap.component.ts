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
        this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - 160;
        this.cdRef.detectChanges();
    }

    plotIssuesOnRoadmap() {
        const minStartDateRecord: any = _.minBy(_.union(this.roadmap.epicChildren || [], this.roadmap.relatedLinks || []), 'created');
        const minStartDate = minStartDateRecord && minStartDateRecord.created ? new Date(minStartDateRecord.created) : new Date();
        const maxDueDateRecord: any = _.maxBy(_.union(this.roadmap.epicChildren || [], this.roadmap.relatedLinks || []), 'duedate');
        const maxDueDate = maxDueDateRecord && maxDueDateRecord.duedate ? new Date(maxDueDateRecord.duedate) : new Date();

        this.roadmap.metadata = initRoadmapMetadata(minStartDate, maxDueDate);

        this.roadmap.data = [
            {
                data: this.createParentNode(this.roadmap, this.roadmap.epicChildren),
                children: this.transformToTreeChildren(_.orderBy(this.roadmap.epicChildren, 'created'), this.roadmap.metadata.timespan),
                leaf: false,
                expanded: true

            },
            {
                data: this.createParentNode({ title: 'Related stories' }, this.roadmap.relatedLinks),
                children: this.transformToTreeChildren(_.orderBy(this.roadmap.relatedLinks, 'created'), this.roadmap.metadata.timespan),
                leaf: false,
                expanded: true
            },
        ]
    }

    private createParentNode(node, children) {
        const record = {
            label: node.title,
            title: this.prepareTitle(node),
            created: _.minBy(children, 'created'),
            duedate: _.maxBy(children, 'updated'),
            isHeading: true
        };
        return record;
    }

    private transformToTreeChildren(children, timespanLookup) {
        return _.map(children, (ec) => {
            const record = _.pick(ec, ['label', 'title', 'icon', 'key', 'issueType', 'status', 'timespan', 'created', 'duedate']);
            record.label = record.title;
            record.title = this.prepareTitle(record);
            const duedate = ec.duedate ? new Date(ec.duedate) : new Date();
            const created = ec.created ? new Date(ec.created) : new Date();
            record.timespan = _.map(timespanLookup, (ts) => {
                return {
                    idx: ts.idx,
                    isInTimespan:
                        created <= ts.lastDate &&
                        ((duedate >= ts.firstDate && duedate <= ts.lastDate) || duedate > ts.lastDate)
                };
            });
            return { data: record };
        });
    }

    private prepareTitle(node: any) {
        const created = node.created ? this.toShortDate(new Date(node.created)) + ' -> ' : ''
        const duedate = node.updated ? this.toShortDate(new Date(node.duedate)) : ''
        const key = node.key ? node.key + ": " : '';
        const status = node.status ? `[${node.status}]` : '';
        return `${key} ${node.title} ${status} ${created} ${duedate}`;
    }

    toShortDate(date) {
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    }
}

