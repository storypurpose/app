import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PurposeState } from '../+state/purpose.state';
import { Store } from '@ngrx/store';
import { PersistenceService } from 'src/app/lib/persistence.service';

@Component({
    selector: 'app-purpose',
    templateUrl: './purpose.component.html'
})
export class PurposeDetailsComponent implements OnInit, OnDestroy {
    @Output() edit = new EventEmitter<any>();

    public showAll = false;
    hideExtendedFields = false;

    selectedItem$: Subscription;
    selectedItem: any;

    public purpose$: Subscription;
    public purpose: any;

    public hierarchySetupVisibility$: Subscription;

    public fontSizeSmall = false;

    constructor(public persistenceService: PersistenceService,
        public store$: Store<PurposeState>
    ) {
    }

    ngOnInit(): void {
        this.selectedItem$ = this.store$.select(p => p.purpose.selectedItem)
            .pipe(filter(p => p))
            .subscribe(p => this.selectedItem = p);

        this.purpose$ = this.store$.select(p => p.purpose.item).pipe(filter(p => p))
            .subscribe(data => {
                this.purpose = data;
                this.showHideAllPurposes(false);
            });
    }

    ngOnDestroy(): void {
        this.purpose$ ? this.purpose$.unsubscribe() : null;
        this.hierarchySetupVisibility$ ? this.hierarchySetupVisibility$.unsubscribe() : null;
        this.selectedItem$ ? this.selectedItem$.unsubscribe() : null;
    }

    showHideAllPurposes(value) {
        this.showAll = value;
        if (this.purpose) {
            this.purpose.forEach(u => u.show = this.showAll)
            if (!this.showAll && this.purpose.length > 0) {
                this.purpose[this.purpose.length - 1].show = true;
            }
        }
    }
}
