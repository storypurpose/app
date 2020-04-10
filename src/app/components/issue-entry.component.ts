import { Component, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { Subscription, Subject, Observable, merge } from 'rxjs';
import { filter, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-issue-entry',
    templateUrl: './issue-entry.component.html'
})
export class IssueEntryComponent implements OnInit, OnDestroy {
    @Input() issueLookup: any;
    @Input() hideIssuelistNavigator = true;

    @Output() showIssuelist = new EventEmitter<any>();

    issue: string;
    subscription: Subscription;
    constructor(public router: Router,
        public activatedRoute: ActivatedRoute,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.subscription = this.store$.select(p => p.app)
            .pipe(filter(p => p && p.currentIssueKey && p.currentIssueKey.length > 0), map(p => p.currentIssueKey))
            .subscribe(key => this.issue = key);
    }
    ngOnDestroy(): void {
        this.subscription ? this.subscription.unsubscribe : null;
    }

    canNavigate = () => this.issue && this.issue.trim().length > 0

    navigateTo(issue) {
        if (this.canNavigate()) {
            this.router.navigate(['/for', issue.trim()]);
        }
    }
    selectTo(issue) {
        if (this.canNavigate()) {
            const issueToNavigate = issue.trim();

            _.find(this.issueLookup, (i) => i === issueToNavigate)
                ? this.router.navigate(['selected', issueToNavigate, 'purpose'], { relativeTo: this.activatedRoute })
                : this.router.navigate(['/for', issueToNavigate, 'selected', issueToNavigate, 'purpose']);
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

    onShowEpiclist(){
        this.showIssuelist.emit(true);
    }
}
