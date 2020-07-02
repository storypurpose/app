import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { initializeMetadata, mergeMetadata, extractMetadata, populateStatistics } from 'src/app/lib/statistics-utils';
import { SearchState } from '../+state/search.state';
import { Viewbase } from './view-base';
@Component({
    selector: 'app-storyboard-view',
    templateUrl: './storyboard-view.component.html'
})
export class SearchStoryboardViewComponent extends Viewbase implements OnInit, OnDestroy {
    selectedStatuses: any = [];
    statusLookup = [];

    showStatistics = false;
    groupByColumn = "components";

    public storyboardItem: any;

    public constructor(public activatedRoute: ActivatedRoute,
        public store$: Store<SearchState>) {
        super(store$);
    }

    ngOnInit(): void {
        this.storyboardItem = { query: null, children: [] };
        this.subscribeIssuelist();
        // this.issuelist$ = this.store$.select(p => p.search.issuelist)
        //     .pipe(filter(p => p))
        //     .subscribe(list => {
        //         this.issuelist = list;
        //         this.plotStoryboard();
        //     });
    }

    ngOnDestroy(): void {
        this.unsubscribeIssuelist();
        // this.issuelist$ ? this.issuelist$.unsubscribe() : null;
    }

    onGroupByColumnChanged() {
        this.plotStoryboard();
    }

    onIssuelistLoaded(): void {
        this.plotStoryboard();
    }

    plotStoryboard() {
        const filters = _.map(this.selectedStatuses, 'key');

        this.storyboardItem.metadata = initializeMetadata(this.groupByColumn);
        this.storyboardItem.children = this.filterByStatus(this.issuelist.results, filters);
        mergeMetadata(this.storyboardItem.metadata, extractMetadata(this.storyboardItem.children, this.groupByColumn), this.groupByColumn);
        this.storyboardItem.statistics = populateStatistics(this.storyboardItem.metadata, this.storyboardItem.children, "Statistics", this.groupByColumn);

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
