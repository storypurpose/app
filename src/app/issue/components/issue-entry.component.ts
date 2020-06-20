import { Component, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { AppState } from '../../+state/app.state';
import { Store } from '@ngrx/store';
import { Subscription, Subject, Observable, merge } from 'rxjs';
import { filter, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { IssueState } from '../+state/issue.state';

@Component({
    selector: 'app-select-issue-entry',
    templateUrl: './issue-entry.component.html'
})
export class IssueEntryComponent implements OnInit, OnDestroy {
    @Input() showCancel = false;
    @Input() size: string;
    @Input() issueLookup: any;
    @Input() hideIssuelistNavigator = true;

    @Output() showIssuelist = new EventEmitter<any>();
    @Output() cancel = new EventEmitter<any>();
    issue: string;
    subscription: Subscription;
    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public store$: Store<IssueState>) {
    }
    ngOnInit(): void {
        this.subscription = this.store$.select(p => p.issue.primaryIssueKey)
            .pipe(filter(p => p && p.length > 0))
            .subscribe(key => this.issue = key);
    }
    ngOnDestroy(): void {
        this.subscription ? this.subscription.unsubscribe : null;
    }

    canNavigate = () => this.issue && this.issue.trim().length > 0

    navigateTo(issue) {
        if (this.canNavigate()) {
            this.cancel.emit(true);
            this.router.navigate(['/browse', issue.trim()]);
        }
    }
    selectTo(issue) {
        if (this.canNavigate()) {
            const issueToNavigate = issue.trim();

            this.cancel.emit(true);

            _.find(this.issueLookup, (i) => i === issueToNavigate)
                ? this.router.navigate(['purpose', issueToNavigate, 'details'], { relativeTo: this.activatedRoute })
                : this.router.navigate(['/browse', issueToNavigate, 'purpose', issueToNavigate, 'details']);
        }
    }

    @ViewChild('instance', { static: true }) instance: NgbTypeahead;
    focus$ = new Subject<string>();
    click$ = new Subject<string>();

    search = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
        const inputFocus$ = this.focus$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$)
            .pipe(
                map(term =>
                    term === ''
                        ? this.issueLookup
                        : _.filter(this.issueLookup || [], v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)),
                map(list => (list || []).slice(0, 20))
            );
    }

    onShowEpiclist() {
        this.showIssuelist.emit(true);
    }
    onCancel() {
        this.cancel.emit(true);
    }
}
