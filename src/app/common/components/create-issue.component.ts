import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { CommonState } from '../+state/common.state';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LoadIssueLinkTypesAction, LoadCreateIssueMetadataAction } from '../+state/common.actions';

@Component({
    selector: 'app-create-issue',
    templateUrl: './create-issue.component.html'
})
export class CreateIssueComponent implements OnInit, OnDestroy {
    @Input() project;
    @Output() issueCreated = new EventEmitter<any>();

    @Output() close = new EventEmitter<any>();

    createIssueMetadata$: Subscription;
    createIssueMetadata: any;

    record: any = {};
    constructor(public store$: Store<CommonState>) {

    }
    ngOnInit(): void {
        this.createIssueMetadata$ = this.store$.select(p => p.common.createIssueMetadata)
            .subscribe(list => this.createIssueMetadata = list)

        if (this.project && this.project.key) {
            this.store$.dispatch(new LoadCreateIssueMetadataAction(this.project.key));
        }
    }
    ngOnDestroy(): void {
        this.createIssueMetadata$ ? this.createIssueMetadata$.unsubscribe() : null;
    }


    onClose = () => this.close.emit(null);
    onSave() {
    }
    onReset() {
        this.onClose();
    }

}