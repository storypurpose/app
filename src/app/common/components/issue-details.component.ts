import { Component, Input, EventEmitter, Output, HostListener } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-issue-details',
    templateUrl: './issue-details.component.html'
})
export class IssueDetailsComponent {
    issue: any;
    private _currentIndex: number;
    @Input() set currentIndex(value: number) {
        this._currentIndex = value;
        this.loadIssueAtIndex(value);
    }
    get currentIndex() {
        return this._currentIndex;
    }

    @Input() list: any;

    @Output() close = new EventEmitter<any>();
    onClose = () => this.close.emit(null);

    loadIssueAtIndex(index) {
        if (this.list && this.list.length > index) {
            this.issue = this.list[index];
        }
    }

    navigateToPrevious() {
        this.currentIndex = this.currentIndex - 1;
    }

    navigateToNext() {
        this.currentIndex = this.currentIndex + 1;
    }
}
