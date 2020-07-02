import { Component, Input, EventEmitter, Output, HostListener, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Key } from 'ts-key-enum';

@Component({
    selector: 'app-issue-details',
    templateUrl: './issue-details.component.html'
})
export class IssueDetailsComponent {
    @Input() enableEdits;
    @Output() fieldUpdated = new EventEmitter<any>();
    issue: any;
    private _currentIndex: number;
    @Input() set currentIndex(value: number) {
        this._currentIndex = value;
        this.loadIssueAtIndex(value);
    }
    get currentIndex() {
        return this._currentIndex;
    }
    @Output() currentIndexChange = new EventEmitter<any>();

    @Input() list: any;

    @Output() close = new EventEmitter<any>();
    onClose = () => this.close.emit(null);

    loadIssueAtIndex(index) {
        if (this.list && this.list.length > index) {
            this.issue = this.list[index];
        }
    }

    navigateToPrevious() {
        this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : 0;
        this.currentIndexChange.emit(this.currentIndex);
    }

    navigateToNext() {
        this.currentIndex = (this.list && this.currentIndex < (this.list.length - 1)) ? this.currentIndex + 1 : this.currentIndex;
        this.currentIndexChange.emit(this.currentIndex);
    }

    onTitleUpdated(eventArgs) {
        this.fieldUpdated.emit({ issueKey: this.issue.key, fieldName: 'summary', updatedValue: eventArgs.updated });
        this.issue.title = eventArgs.updated;
    }

    onDescUpdated(eventArgs) {
        this.fieldUpdated.emit({ issueKey: this.issue.key, fieldName: 'description', updatedValue: eventArgs.updated });
        this.issue.description = eventArgs.updated;
    }
}
