import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { SetExtendedHierarchyDetailsAction } from 'src/app/+state/app.actions';

@Component({
    selector: 'app-hierarchy-field',
    templateUrl: './hierarchy-field.component.html'
})
export class HierarchyFieldEditorComponent implements OnInit {
    @Output() close = new EventEmitter<any>();
    @Input() hierarchyField: any;

    constructor(public store$: Store<AppState>) {
    }
    ngOnInit(): void {
    }

    canSave = () => this.hierarchyField && this.hierarchyField.purpose && this.hierarchyField.purpose.trim().length > 0;
    onSave() {
        this.store$.dispatch(new SetExtendedHierarchyDetailsAction(this.hierarchyField));
        this.onClose(true);
    }
    onClose(shouldReload) {
        this.close.emit(shouldReload);
    }
}
