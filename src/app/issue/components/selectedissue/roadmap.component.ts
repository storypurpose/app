import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { populatedFieldList } from 'src/app/lib/jira-tree-utils';
import { filter } from 'rxjs/operators';
import { IssueState } from '../../+state/issue.state';
import { ResizableContainerBase } from './resizable-container-base';
import { PopulateIssueRoadmapViewAction } from '../../+state/issue.actions';

@Component({
    selector: 'app-roadmap',
    templateUrl: './roadmap.component.html'
})

export class RoadmapComponent extends ResizableContainerBase implements OnInit, OnDestroy, AfterViewInit {

    timespan: any;

    selectedIssue$: Subscription;
    selectedIssue: any;
    roadmap$: Subscription;
    roadmap: any;

    constructor(public cdRef: ChangeDetectorRef, public store$: Store<IssueState>) {
        super(cdRef, store$);
    }

    ngOnInit(): void {
        this.init(92);

        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue)
            .pipe(filter(p => p))
            .subscribe(selectedIssue => {
                this.selectedIssue = _.pick(selectedIssue, _.union(populatedFieldList, ['children']));
                this.store$.dispatch(new PopulateIssueRoadmapViewAction(this.selectedIssue.children));
            });

        this.roadmap$ = this.store$.select(p => p.issue.roadmapView)
            .pipe(filter(p => p))
            .subscribe(p => this.roadmap = p);
    }

    ngOnDestroy(): void {
        this.destroy();
        this.selectedIssue$ ? this.selectedIssue$.unsubscribe() : null;
        this.roadmap$ ? this.roadmap$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.afterViewInit();
    }
}

