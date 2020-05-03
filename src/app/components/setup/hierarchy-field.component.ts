import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import * as _ from 'lodash';
import { CachingService } from 'src/app/lib/caching.service';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-hierarchy-field',
    templateUrl: './hierarchy-field.component.html'
})
export class HierarchyFieldEditorComponent implements OnInit {
    @Output() close = new EventEmitter<any>();
    @Input() hierarchyField: any;
    constructor(public jiraService: JiraService, 
        public cachingService: CachingService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
    }

    canSave = () => this.hierarchyField && this.hierarchyField.purpose && this.hierarchyField.purpose.trim().length > 0;
    onSave() {
        //this.store$.dispatch();
        this.cachingService.setExtendedHierarchyDetails(this.hierarchyField);
        this.onClose(true);
    }
    onClose(shouldReload) {
        this.close.emit(shouldReload);
    }
    onReset() {
        this.cachingService.resetExtendedHierarchy();
        this.onClose(true);
    }
}
