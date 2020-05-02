import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JiraService } from '../../lib/jira.service';
import { AppState } from 'src/app/+state/app.state';
import { SetSavedSearchlistAction } from '../+state/search.actions';

@Component({
    selector: 'app-favourite-searches',
    templateUrl: './favourite-searches.component.html'
})
export class FavouriteSearchesComponent implements OnInit, OnDestroy {    
    searchlist: any;
    searchlist$: Subscription;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public jiraService: JiraService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.searchlist$ = this.store$.select(p => p.search.savedSearchlist).pipe(filter(p => p))
            .subscribe(list => this.searchlist = list);

        this.jiraService.favouriteSearches('favourite-search.json')
            .pipe(
                filter((list: any) => list && list.length > 0),
                map(list => _.map(list, item => _.pick(item, ['id', 'name', 'jql'])))
            )
            .subscribe(list => this.store$.dispatch(new SetSavedSearchlistAction(list)));
    }
    ngOnDestroy(): void {
        this.searchlist$ ? this.searchlist$.unsubscribe : null;
    }
}
