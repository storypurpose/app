import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { ChartOptions } from 'chart.js';

@Component({
    selector: 'app-fixversions-editor',
    templateUrl: './fixversions-editor.component.html'
})
export class FixVersionsEditorComponent {
    @Input() issue: any;
    @Output() changed = new EventEmitter<any>();

    save() {
        this.changed.emit(this.issue.updated.fixVersions);
    }

    cancel() {
        this.changed.emit(null);
    }
}