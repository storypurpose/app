import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import * as _ from 'lodash';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-hierarchy-field',
    templateUrl: './hierarchy-field.component.html'
})
export class HierarchyFieldEditorComponent implements OnInit {
    @Output() close = new EventEmitter<any>();
    @Input() hierarchyField: any;
    constructor(public jiraService: JiraService, public persistenceService: PersistenceService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
    }

    canSave = () => this.hierarchyField && this.hierarchyField.purpose && this.hierarchyField.purpose.trim().length > 0;
    onSave() {
        //this.store$.dispatch();
        this.persistenceService.setExtendedHierarchyDetails(this.hierarchyField);
        this.onClose(true);
    }
    onClose(shouldReload) {
        this.close.emit(shouldReload);
    }
    onReset() {
        this.persistenceService.resetExtendedHierarchy();
        this.onClose(true);
    }
}
