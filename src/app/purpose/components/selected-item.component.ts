import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PurposeState } from '../+state/purpose.state';
import { Store } from '@ngrx/store';
import { CustomNodeTypes } from 'src/app/lib/jira-tree-utils';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { ManageOrganizationEditorVisibilityAction, ManageHierarchyEditorVisibilityAction } from '../+state/purpose.actions';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-selected-item',
    templateUrl: './selected-item.component.html'
})
export class SelectedItemComponent implements OnInit, OnDestroy {
    constructor(public persistenceService: PersistenceService,
        public activatedRoute: ActivatedRoute,
        public store$: Store<PurposeState>
    ) {
    }
    ngOnInit(): void {
        this.activatedRoute.params.pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]))
            .subscribe(selected => {
                console.log('selected', selected);
            })
    }

    ngOnDestroy(): void {
    }
}
