import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { initializeMetadata, mergeMetadata, extractMetadata, populateStatistics } from 'src/app/lib/storyboard-utils';

@Component({
    selector: 'app-storyboard-view',
    templateUrl: './storyboard-view.component.html'
})
export class SearchStoryboardViewComponent implements OnInit, OnDestroy {
    showStatistics = false;

    issuelist$: Subscription;
    public storyboardItem: any;

    public constructor(public store$: Store<AppState>,
        public activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.storyboardItem = { query: null, children: [] };

        this.issuelist$ = this.store$.select(p => p.search.issuelist)
            .pipe(filter(p => p))
            .subscribe(list => {
                this.storyboardItem.metadata = initializeMetadata();
                console.log(list);
                this.storyboardItem.children = list.results;
                mergeMetadata(this.storyboardItem.metadata, extractMetadata(this.storyboardItem.children));
                this.storyboardItem.statistics = populateStatistics(this.storyboardItem);
            });
    }

    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe() : null;
    }
}
