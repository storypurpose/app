import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { initializeMetadata, mergeMetadata, extractMetadata, populateStatistics } from 'src/app/lib/statistics-utils';
import { SearchState } from '../+state/search.state';

@Component({
    selector: 'app-storyboard-view',
    templateUrl: './storyboard-view.component.html'
})
export class SearchStoryboardViewComponent implements OnInit, OnDestroy {
    selectedStatuses: any = [];
    statusLookup = [];

    showStatistics = false;

    issuelist$: Subscription;
    issuelist: any;

    public storyboardItem: any;

    public constructor(public activatedRoute: ActivatedRoute,
        public store$: Store<SearchState>) {
    }

    ngOnInit(): void {
        this.storyboardItem = { query: null, children: [] };

        this.issuelist$ = this.store$.select(p => p.search.issuelist)
            .pipe(filter(p => p))
            .subscribe(list => {
                this.issuelist = list;
                this.plotStoryboard();
            });
    }

    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe() : null;
    }

    plotStoryboard() {
        const filters = _.map(this.selectedStatuses, 'key');

        this.storyboardItem.metadata = initializeMetadata();
        this.storyboardItem.children = this.filterByStatus(this.issuelist.results, filters);
        mergeMetadata(this.storyboardItem.metadata, extractMetadata(this.storyboardItem.children));
        this.storyboardItem.statistics = populateStatistics(this.storyboardItem.metadata, this.storyboardItem.children);

        if (this.storyboardItem.statistics && this.statusLookup && this.statusLookup.length === 0) {
            this.statusLookup = this.storyboardItem.statistics.status;
        }
    }

    private filterByStatus = (list, filters) =>
        (filters && filters.length > 0)
            ? _.filter(list, (r) => _.find(filters, f => f === r.status) !== undefined)
            : list;

    onSelectedStatusChange() {
        this.plotStoryboard()
    }
}
