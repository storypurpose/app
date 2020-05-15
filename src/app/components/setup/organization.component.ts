import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import * as _ from 'lodash';
import { CachingService } from 'src/app/lib/caching.service';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { SetOrganizationAction } from 'src/app/+state/app.actions';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-organization',
    templateUrl: './organization.component.html'
})
export class OrganizationComponent implements OnInit, OnDestroy {
    @Output() close = new EventEmitter<any>();
    organization: any;
    organization$: Subscription;

    constructor(public cachingService: CachingService,
        public store$: Store<AppState>) {
    }

    ngOnInit() {
        this.organization$ = this.store$.select(p => p.app.organization)
            .subscribe(p => this.organization = p || {})
    }
    ngOnDestroy() {
        this.organization$ ? this.organization$.unsubscribe() : null;
    }
    canSave = () => this.organization && this.organization.name && this.organization.name.trim().length > 0;
    onSave() {
        this.store$.dispatch(new SetOrganizationAction(this.organization));
        this.cachingService.setOrganization(this.organization);
        this.onClose(false);
    }
    onClose(shouldReload) {
        this.close.emit(shouldReload);
    }
    onReset() {
        this.cachingService.resetOrganization();
        this.onClose(true);
    }
}
