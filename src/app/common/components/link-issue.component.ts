import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { CommonState } from '../+state/common.state';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LoadIssueLinkTypesAction } from '../+state/common.actions';

@Component({
    selector: 'app-link-issue',
    templateUrl: './link-issue.component.html'
})
export class LinkIssueComponent implements OnInit, OnDestroy {
    @Input() issue;
    @Output() issueLinked = new EventEmitter<any>();

    @Output() close = new EventEmitter<any>();

    issueLinkTypes$: Subscription;
    issueLinkTypes: any;

    record: any = {};
    constructor(public store$: Store<CommonState>) {

    }
    ngOnInit(): void {
        this.issueLinkTypes$ = this.store$.select(p => p.common.issueLinkTypes)
            .pipe(filter(list => list && list.length > 0))
            .subscribe(list => this.issueLinkTypes = list)

        this.store$.dispatch(new LoadIssueLinkTypesAction(null));
    }
    ngOnDestroy(): void {
        this.issueLinkTypes$ ? this.issueLinkTypes$.unsubscribe() : null;
    }


    onClose = () => this.close.emit(null);
    onSave() {
    }
    onReset() {
        this.onClose();
    }

}