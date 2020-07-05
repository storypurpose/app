import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { CommonState } from '../+state/common.state';
import { Subscription, Subject, Observable, merge } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { LoadIssueLinkTypesAction, LoadIssueLookupAction, AddIssueLinkAction } from '../+state/common.actions';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-link-issue',
    templateUrl: './link-issue.component.html'
})
export class LinkIssueComponent implements OnInit, OnDestroy {
    @Input() issue;
    @Output() issueLinked = new EventEmitter<any>();

    @Output() close = new EventEmitter<any>();

    issueLookup$: Subscription;
    issueLookup: any;
    issueLinkTypes$: Subscription;
    issueLinkTypes: any;

    record: any = {};
    constructor(public store$: Store<CommonState>) {

    }
    ngOnInit(): void {
        this.record.sourceIssue = this.issue;
        this.issueLinkTypes$ = this.store$.select(p => p.common.issueLinkTypes)
            .pipe(filter(list => list && list.length > 0))
            .subscribe(list => this.issueLinkTypes = list)

        this.issueLookup$ = this.store$.select(p => p.common.issueLookup)
            .subscribe(list => this.issueLookup = list || [])

        this.store$.dispatch(new LoadIssueLinkTypesAction(null));
    }
    ngOnDestroy(): void {
        this.issueLinkTypes$ ? this.issueLinkTypes$.unsubscribe() : null;
        this.issueLookup$ ? this.issueLookup$.unsubscribe() : null;
    }

    onClose = () => this.close.emit(null);
    canSave = () => this.record.sourceIssue && this.record.linkedIssue && this.record.linktype;
    onSave() {
        this.store$.dispatch(new AddIssueLinkAction(this.record));
        this.onClose();
    }
    onReset() {
        this.onClose();
    }

    search(event) {
        if (event && event.query && event.query.length > 0) {
            this.store$.dispatch(new LoadIssueLookupAction({ projectKey: this.issue.project.key, query: event.query }));
        }
    }
}