import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-field-selector-list',
    templateUrl: './field-selector-list.component.html'
})
export class FieldSelectorListComponent implements OnInit {
    @Input() list: any;
    @Output() listChange = new EventEmitter<any>();
    @Input() customFields: any;

    selectedField: any;

    ngOnInit(): void {
        this.list = this.list || [];
    }

    add() {
        if (this.selectedField) {
            const found = _.find(this.customFields, { id: this.selectedField });
            if (found) {
                if (!_.find(this.list, { id: found.id })) {
                    this.list.push(_.clone(found));
                }
            }
        }
    }
    remove(index) {
        this.list.splice(index, 1);
    }
}