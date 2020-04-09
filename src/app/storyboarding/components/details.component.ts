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
    public constructor(public store$: Store<StoryboardingState>) {

    }

    ngOnInit(): void {
        this.storyboardItem$ = this.store$.select(p => p.storyboarding.storyboardItem).pipe(p => p)
            .subscribe(p => this.storyboardItem = p);
    }
    ngOnDestroy(): void {
        this.storyboardItem$ ? this.storyboardItem$.unsubscribe() : null;
    }

    getItems(fv, c) {
        if (!this.storyboardItem || !this.storyboardItem.children)
            return [];

        return _.filter(this.storyboardItem.children, p => _.includes(p.components, c) && _.includes(p.fixVersions, fv))
    }
}
