import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

const SelectionModeTypes = {
    Single: "single",
    Multiple: "muliple"
}
@Component({
    selector: 'app-multilist-selector',
    templateUrl: './multilist-selector.component.html'
})
export class MultilistSelectorComponent implements OnInit {
    @Input() showHelp: boolean;
    @Input() selectionMode: string; // single
    @Input() formMode: boolean;
    @Input() selectOnChange: boolean;
    @Input() fieldTitle: string;
    @Output() fieldValueChange = new EventEmitter<any>();

    @Input() record: any;
    @Output() recordChange = new EventEmitter<any>();
    @Input() list: any;
    @Input() lookupList: any;

    selectedField: any;

    ngOnInit(): void {
        this.list = this.list || [];
    }
    resetRecord() {
        this.record = null;
        this.recordChange.emit(null);
    }
    addOnChange = () => (this.selectOnChange === true) ? this.add() : null;

    add() {
        if (this.selectedField) {
            const found = _.find(this.lookupList, { id: this.selectedField });
            if (found) {
                if (this.selectionMode === SelectionModeTypes.Single) {
                    this.record = _.clone(found);
                    this.recordChange.emit(this.record);
                } else if (!_.find(this.list, { id: found.id })) {
                    this.list.push(_.clone(found));
                }
            }
            this.selectedField = null;
        }
    }
    remove = (index) => this.list.splice(index, 1);

    save = () => this.fieldValueChange.emit(this.list);

    cancel = () => this.fieldValueChange.emit(null);
}