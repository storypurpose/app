import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { JiraService } from '../../lib/jira.service';
import { AppState } from 'src/app/+state/app.state';

@Component({
    selector: 'app-search-listview',
    templateUrl: './list-view.component.html'
})
export class SearchListViewComponent implements OnInit, OnDestroy {

    query: string;
    issuelist: any;
    issuelist$: Subscription;
    queryParams$: Subscription;
    query$: Subscription;

    public currentPageIndex = 1;

    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public jiraService: JiraService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.issuelist$ = this.store$.select(p => p.search.issuelist).pipe(filter(p => p))
            .subscribe(key => this.issuelist = key);
    }
    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe : null;
    }

    canNavigate = () => this.issuelist && this.issuelist.trim().length > 0;
    navigateTo(issue) {
        if (this.canNavigate()) {
            this.router.navigate(['/browse', issue.trim()]);
        }
    }
}
