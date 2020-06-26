import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { LoadSubtasksAction, LoadCommentsAction } from '../../+state/issue.actions';
import { IssueState } from '../../+state/issue.state';

@Component({
    selector: 'app-comment-list',
    templateUrl: './comment-list.component.html'
})
export class CommentlistComponent implements OnInit, OnDestroy {
    _issueKey: any;
    @Input() set issueKey(value: any) {
        this._issueKey = value;
        this.loadComments();
    }
    get issueKey() { return this._issueKey; }

    comments$: Subscription;
    comments: any;
    loading = false;
    constructor(public store$: Store<IssueState>) {
    }

    ngOnInit(): void {
        this.comments$ = this.store$.select(p => p.issue.comments)
            .pipe(filter(p => p))
            .subscribe(comments => {
                this.comments = comments;
                this.loading = false;
            })
    }

    ngOnDestroy(): void {
        this.comments$ ? this.comments$.unsubscribe() : null;
    }

    loadComments() {
        this.comments = null;
        if (this.issueKey) {
            this.loading = true;
            this.store$.dispatch(new LoadCommentsAction(this.issueKey));
        }
    }
}
