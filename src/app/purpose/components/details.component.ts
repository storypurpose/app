import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PurposeState } from '../+state/purpose.state';
import { Store } from '@ngrx/store';
import { CustomNodeTypes } from 'src/app/lib/tree-utils';
import { PersistenceService } from 'src/app/lib/persistence.service';

@Component({
    selector: 'app-purpose-details',
    templateUrl: './details.component.html'
})
export class PurposeDetailsComponent implements OnInit, OnDestroy {
    _purpose: any;
    @Input()
    set purpose(value: any) {
        this._purpose = value;
    }
    get purpose(): any {
        return this._purpose;
    }

    @Output() edit = new EventEmitter<any>();

    public showOrganizationSetup = false;
    public organizationPurpose: any;

    public showHierarchyFieldSetup = false;
    public hierarchyFieldPurpose: any;

    public subscription: Subscription;

    constructor(public persistenceService: PersistenceService,
        public store$: Store<PurposeState>
    ) {
        this.organizationPurpose = this.persistenceService.getOrganizationDetails();

    }
    ngOnInit(): void {
        this.subscription = this.store$.select(p => p.purpose)
            .pipe(filter(p => p && p.item), map(p => p.item))
            .subscribe(data => this.purpose = data);
    }
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onEdit(item) {
        if (item.issueType === CustomNodeTypes.Organization) {
            this.showOrganizationSetup = true;
        } else if (item.editable === true) {
            this.hierarchyFieldPurpose = _.clone(item);
            this.showHierarchyFieldSetup = true;
        }
        this.edit.emit(item);
    }

    public setupOrganization() {
        this.showOrganizationSetup = true;
    }
    setupCompleted(shouldReload) {
        console.log(shouldReload);
        if (shouldReload) {
            window.location.reload();
        } else {
            this.showOrganizationSetup = false;
            this.showHierarchyFieldSetup = false;
        }
    }

}
