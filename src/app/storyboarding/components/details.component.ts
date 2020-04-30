import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { StoryboardingState } from '../+state/storyboarding.state';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-storyboard-details',
    templateUrl: './details.component.html'
})
export class StoryboardComponent implements OnInit, OnDestroy {

    storyboardItem$: Subscription;
    @Input() storyboardItem: any;

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
}
