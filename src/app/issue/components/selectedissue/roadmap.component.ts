import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, populatedFieldList } from 'src/app/lib/jira-tree-utils';
import { filter } from 'rxjs/operators';
import { IssueState } from '../../+state/issue.state';
import { initRoadmapMetadata } from 'src/app/lib/roadmap-utils';
import { ResizableContainerBase } from './resizable-container-base';

@Component({
    selector: 'app-roadmap',
    templateUrl: './roadmap.component.html'
})

export class RoadmapComponent extends ResizableContainerBase implements OnInit, OnDestroy, AfterViewInit {

    roadmap: any;
    timespan: any;

    selectedIssue$: Subscription;
    selectedIssue: any;

    constructor(public cdRef: ChangeDetectorRef, public store$: Store<IssueState>) {
        super(cdRef, store$);
    }

    ngOnInit(): void {
        this.init(92);

        this.selectedIssue$ = this.store$.select(p => p.issue.selectedIssue)
            .pipe(filter(p => p))
            .subscribe(selectedIssue => {
                this.selectedIssue = _.pick(selectedIssue, _.union(populatedFieldList, ['children']));
            })
    }

    ngOnDestroy(): void {
        this.destroy();
        this.selectedIssue$ ? this.selectedIssue$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.afterViewInit();
    }
}

