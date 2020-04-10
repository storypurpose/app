import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { StoryboardingState } from '../+state/storyboarding.state';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-storyboard-details',
    templateUrl: './details.component.html'
})
export class StoryboardComponent implements OnInit, OnDestroy {

    storyboardItem$: Subscription;
    public storyboardItem: any;

    expandedAll = true;

    public constructor(public store$: Store<StoryboardingState>) {
    }

    ngOnInit(): void {
        this.storyboardItem$ = this.store$.select(p => p.storyboarding.storyboardItem).pipe(filter(p => p))
            .subscribe(p => this.storyboardItem = p);
    }
    ngOnDestroy(): void {
        this.storyboardItem$ ? this.storyboardItem$.unsubscribe() : null;
    }

    getItems(fixVersion, component) {
        if (!this.storyboardItem || !this.storyboardItem.children)
            return [];

        let records = [];
        if (fixVersion.componentWise) {
            const found = _.find(fixVersion.componentWise, { component: component.title });
            records = found.values;
        }
        return records;
    }

    expandCollapseAll() {
        this.expandedAll = !this.expandedAll;
        if (this.storyboardItem && this.storyboardItem.fixVersions) {
            this.storyboardItem.fixVersions.forEach(u => u.expanded = this.expandedAll);
        }
    }
}
