import { Store } from '@ngrx/store';
import { SearchState } from '../+state/search.state';
import { UpdateSearchFieldValueAction } from '../+state/search.actions';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';

export abstract class Viewbase {
    issuelist: any;
    issuelist$: Subscription;

    issueDetailsVisible = false;
    issueDetails: any;
    currentIndex = 0;

    constructor(public store$: Store<SearchState>) {
    }

    abstract onIssuelistLoaded(): void;

    subscribeIssuelist() {
        this.issuelist$ = this.store$.select(p => p.search.issuelist)
            .pipe(filter(p => p))
            .subscribe(key => {
                this.issuelist = key;
                this.onIssuelistLoaded();
            });
    }
    unsubscribeIssuelist() {
        this.issuelist$ ? this.issuelist$.unsubscribe : null;
    }

    onFieldUpdated(eventArgs) {
        this.store$.dispatch(new UpdateSearchFieldValueAction(eventArgs));
    }

    public openIssueAtIndex(index) {
        this.issueDetailsVisible = true;
        this.currentIndex = index;
    }

    onItemSelected(eventArgs) {
        if (this.issuelist && this.issuelist.results && eventArgs && eventArgs.issueKey) {
            const foundIndex = _.findIndex(this.issuelist.results, { key: eventArgs.issueKey });
            if (foundIndex >= 0) {
                this.openIssueAtIndex(foundIndex);
            }
        }
    }
}