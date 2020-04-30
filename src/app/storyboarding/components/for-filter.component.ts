import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { initializeMetadata, mergeMetadata, extractMetadata, populateStatistics } from 'src/app/lib/storyboard-utils';

@Component({
    selector: 'app-storyboard-for-filter',
    templateUrl: './for-filter.component.html'
})
export class StoryboardForFilterComponent implements OnInit, OnDestroy {
    showStatistics = false;

    issuelist$: Subscription;
    public storyboardItem: any;

    public constructor(public store$: Store<AppState>,
        public activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.storyboardItem = {
            metadata: initializeMetadata(),
            query: null,
            children: []
        };
        this.activatedRoute.queryParams.pipe(filter(qp => qp && qp["query"] && qp["query"].length > 0), map(p => p["query"]))
            .subscribe(query => this.storyboardItem.query = query);

        this.issuelist$ = this.store$.select(p => p.search.issuelist)
            .pipe(filter(p => p), map(p => p.results))
            .subscribe(list => {
                this.storyboardItem.children = list;
                mergeMetadata(this.storyboardItem.metadata, extractMetadata(this.storyboardItem.children));
                this.storyboardItem.statistics = populateStatistics(this.storyboardItem);
            });
    }

    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe() : null;
    }
}
