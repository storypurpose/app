import { Component, Input, EventEmitter, Output, HostListener, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Key } from 'ts-key-enum';

@Component({
    selector: 'app-issue-details',
    templateUrl: './issue-details.component.html'
})
export class IssueDetailsComponent {
    @Input() enableEdits;
    @Output() descriptionUpdated = new EventEmitter<any>();
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
        this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : 0;
    }

    navigateToNext() {
        this.currentIndex = (this.list && this.currentIndex < (this.list.length - 1)) ? this.currentIndex + 1 : this.currentIndex;
    }

    editDescription = false;
    descMomento: string;
    onEditDescription() {
        if (this.issue) {
            this.descMomento = this.issue.description;
            this.editDescription = true;
        }
    }
    onSaveDescription() {
        this.descriptionUpdated.emit({ issueKey: this.issue.key, fieldName: 'description', updatedValue: this.descMomento });
        this.issue.description = this.descMomento;
        this.editDescription = false;
    }
    onCancelDescription(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.issue.description = this.descMomento;
        this.editDescription = false;
    }

    // @HostListener('keydown', ['$event'])
    // hotkeyHandler($event: any) {
    //     if ($event.code === Key.ArrowLeft && $event.ctrlKey) {
    //         this.navigateToPrevious();
    //         return false;
    //     } else if ($event.code === Key.ArrowRight && $event.ctrlKey) {
    //         this.navigateToNext();
    //         return false;
    //     }
    // }
}
