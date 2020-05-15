import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JiraService } from '../../lib/jira.service';
import { AppState } from 'src/app/+state/app.state';
import { LoadSavedSearchlistAction } from '../+state/search.actions';
import { SearchState } from '../+state/search.state';

@Component({
    selector: 'app-saved-searches',
    templateUrl: './saved-searches.component.html'
})
export class SavedSearchesComponent implements OnInit, OnDestroy {    
    searchlist: any;
    searchlist$: Subscription;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public jiraService: JiraService,
        public store$: Store<SearchState>) {
    }
    ngOnInit(): void {
        this.searchlist$ = this.store$.select(p => p.search.savedSearchlist).pipe(filter(p => p))
            .subscribe(list => this.searchlist = list);

        this.jiraService.favouriteSearches()
            .pipe(
                filter((list: any) => list && list.length > 0),
                map(list => _.map(list, item => _.pick(item, ['id', 'name', 'jql'])))
            )
            .subscribe(list => this.store$.dispatch(new LoadSavedSearchlistAction(list)));
    }
    ngOnDestroy(): void {
        this.searchlist$ ? this.searchlist$.unsubscribe : null;
    }
}
