import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { StoryboardingState } from '../+state/storyboarding.state';
import { Subscription } from 'rxjs';

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
        this.storyboardItem$ = this.store$.select(p => p.storyboarding.storyboardItem).pipe(p => p)
            .subscribe(p => this.storyboardItem = p);
    }
    ngOnDestroy(): void {
        this.storyboardItem$ ? this.storyboardItem$.unsubscribe() : null;
    }

    getItems(fixVersion, component) {
        if (!this.storyboardItem || !this.storyboardItem.children)
            return [];

        const records = _.filter(this.storyboardItem.children,
            p => _.includes(p.components, component.title) && _.includes(p.fixVersions, fixVersion.title))
        // fixVersion.count += records.length;
        // component.count += records.length;

        // console.log(`${records.length} [${fixVersion.title}: ${fixVersion.count}], [${component.title}: ${component.count}]`);
        return records;
    }

    expandCollapse(value) {
        this.expandedAll = !this.expandedAll;
        if (this.storyboardItem && this.storyboardItem.fixVersions) {
            this.storyboardItem.fixVersions.forEach(u => u.expanded = this.expandedAll);
        }
    }
}
