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
    selector: 'app-purpose',
    templateUrl: './purpose.component.html'
})
export class PurposeDetailsComponent implements OnInit, OnDestroy {
    @Output() edit = new EventEmitter<any>();

    public purpose: any;
    public showAll = false;

    public showOrganizationSetup = false;
    public organizationPurpose: any;
    public showOrgPurposeEditor = false;

    public showHierarchyFieldSetup = false;
    public hierarchyFieldPurpose: any;

    public purpose$: Subscription;
    public hierarchySetupVisibility$: Subscription;
    public orgSetupVisibility$: Subscription;

    public fontSizeSmall = false;
    
    constructor(public persistenceService: PersistenceService,
        public store$: Store<PurposeState>
    ) {
        this.organizationPurpose = this.persistenceService.getOrganizationDetails();
    }

    ngOnInit(): void {
        this.purpose$ = this.store$.select(p => p.purpose.item).pipe(filter(p => p))
            .subscribe(data => {
                this.purpose = data;
                this.showHideAllPurposes(false);
            });

        this.orgSetupVisibility$ = this.store$.select(p => p.purpose.organizationEditorVisible)
            .subscribe(visibility => this.showOrganizationSetup = visibility)

        this.hierarchySetupVisibility$ = this.store$.select(p => p.purpose.hierarchyEditorVisible)
            .subscribe(visibility => this.showHierarchyFieldSetup = visibility)
    }

    ngOnDestroy(): void {
        this.purpose$ ? this.purpose$.unsubscribe() : null;
        this.orgSetupVisibility$ ? this.orgSetupVisibility$.unsubscribe() : null;
        this.hierarchySetupVisibility$ ? this.hierarchySetupVisibility$.unsubscribe() : null;
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
