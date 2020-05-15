import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LoadSavedSearchlistAction } from '../+state/search.actions';
import { SearchState } from '../+state/search.state';

@Component({
    selector: 'app-favourite-searches',
    templateUrl: './favourite-searches.component.html'
})
export class FavouriteSearchesComponent implements OnInit, OnDestroy {
    searchlist: any;
    searchlist$: Subscription;

    constructor(public store$: Store<SearchState>) {
    }
    ngOnInit(): void {
        this.searchlist$ = this.store$.select(p => p.search.savedSearchlist).pipe(filter(p => p))
            .subscribe(list => this.searchlist = list);

        this.store$.dispatch(new LoadSavedSearchlistAction(null));
    }
    ngOnDestroy(): void {
        this.searchlist$ ? this.searchlist$.unsubscribe : null;
    }
}
