import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { populatedFieldList } from 'src/app/lib/jira-tree-utils';
import { filter } from 'rxjs/operators';
import { IssueState } from '../../+state/issue.state';
import { ResizableContainerBase } from './resizable-container-base';
import { PopulateIssueTimelineViewAction } from '../../+state/issue.actions';

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html'
})

export class TimelineComponent extends ResizableContainerBase implements OnInit, OnDestroy, AfterViewInit {

    timespan: any;

    selectedIssue$: Subscription;
    selectedIssue: any;
    timeline$: Subscription;
    timeline: any;

    constructor(public cdRef: ChangeDetectorRef, public store$: Store<IssueState>) {
        super(cdRef, store$);
    }

    ngOnInit(): void {
        this.init(81);

        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue)
            .pipe(filter(p => p))
            .subscribe(selectedIssue => {
                if (selectedIssue.projectConfig && selectedIssue.projectConfig.startdate &&
                    !_.find(populatedFieldList, selectedIssue.projectConfig.startdate.id)) {
                    populatedFieldList.push(selectedIssue.projectConfig.startdate.id);
                }
                this.selectedIssue = _.pick(selectedIssue, _.union(populatedFieldList, ['children']));
                this.store$.dispatch(new PopulateIssueTimelineViewAction(this.selectedIssue.children));
            });

        this.timeline$ = this.store$.select(p => p.issue.timelineView)
            .pipe(filter(p => p))
            .subscribe(p => this.timeline = p);
    }

    ngOnDestroy(): void {
        this.destroy();
        this.selectedIssue$ ? this.selectedIssue$.unsubscribe() : null;
        this.timeline$ ? this.timeline$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.afterViewInit();
    }
}

