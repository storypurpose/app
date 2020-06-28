import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { Subscription, combineLatest } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PopulateSearchResultTimelineViewAction, LoadSearchResultTimelineNodeAction } from '../+state/search.actions';
import { SearchState } from '../+state/search.state';

@Component({
    selector: 'app-timeline-view',
    templateUrl: './timeline-view.component.html'
})
export class SearchTimelineViewComponent implements OnInit, OnDestroy, AfterViewInit {
    combined$: Subscription;

    timeline$: Subscription;
    timeline: any;

    containerSize = 80;
    contentHeight = 0;
    @ViewChild('content') elementView: ElementRef;

    startdateField = 'created';

    public constructor(public cdRef: ChangeDetectorRef,
        public activatedRoute: ActivatedRoute,
        public store$: Store<SearchState>) {
    }

    ngOnInit(): void {
        const issuelistQ = this.store$.select(p => p.search.issuelist).pipe(filter(list => list && list.results), map(p => p.results));
        const projectsQ = this.store$.select(p => p.app.projects);
        this.combined$ = combineLatest(issuelistQ, projectsQ)
            .subscribe(([results, projects]) => {
                if (projects) {
                    const firstProject: any = _.head(projects); //hack take startdate field from first project
                    this.startdateField = firstProject && firstProject.startdate ? firstProject.startdate.id : 'created';
                }
                this.store$.dispatch(new PopulateSearchResultTimelineViewAction({results, startdateField: this.startdateField}));
            });

        this.timeline$ = this.store$.select(p => p.search.timelineView)
            .pipe(filter(p => p))
            .subscribe(p => this.timeline = p);

    }

    ngOnDestroy(): void {
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.timeline$ ? this.timeline$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.onResize();
    }

    @HostListener('window:resize', ['$event'])
    public onResize() {
        if (this.elementView) {
            this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - this.containerSize;
            this.cdRef.detectChanges();
        }
    }

    onNodeExpand(issueKey) {
        this.store$.dispatch(new LoadSearchResultTimelineNodeAction(issueKey));
    }
}
