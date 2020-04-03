import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PurposeState } from '../+state/purpose.state';
import { Store } from '@ngrx/store';
import { CustomNodeTypes } from 'src/app/lib/jira-tree-utils';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { ManageOrganizationEditorVisibilityAction, ManageHierarchyEditorVisibilityAction } from '../+state/purpose.actions';

@Component({
    selector: 'app-purpose-details',
    templateUrl: './details.component.html'
})
export class PurposeDetailsComponent implements OnInit, OnDestroy {
    _purpose: any;
    @Input()
    set purpose(value: any) {
        this._purpose = value;
        this.showHideAllPurposes();
    }
    get purpose(): any {
        return this._purpose;
    }

    @Output() edit = new EventEmitter<any>();

    public showAll = false;

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

        this.store$.select(p => p.purpose.organizationEditorVisible)
            .subscribe(visibility => this.showOrganizationSetup = visibility)
        this.store$.select(p => p.purpose.hierarchyEditorVisible)
            .subscribe(visibility => this.showHierarchyFieldSetup = visibility)
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
        if (shouldReload) {
            window.location.reload();
        } else {
            this.showOrganizationSetup = false;
            this.showHierarchyFieldSetup = false;
            this.store$.dispatch(new ManageOrganizationEditorVisibilityAction(false));
            this.store$.dispatch(new ManageHierarchyEditorVisibilityAction(false));
        }
    }
    showHideAllPurposes() {
        this.showAll = !this.showAll;
        if (this.purpose) {
            this.purpose.forEach(u => u.show = this.showAll)
            if (!this.showAll && this.purpose.length > 0) {
                this.purpose[this.purpose.length - 1].show = true;
            }
        }
    }
}
