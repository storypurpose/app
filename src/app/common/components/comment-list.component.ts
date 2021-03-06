import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CommonState } from '../+state/common.state';
import { LoadCommentsAction, AddCommentAction } from '../+state/common.actions';

@Component({
    selector: 'app-comment-list',
    templateUrl: './comment-list.component.html'
})
export class CommentlistComponent implements OnInit, OnDestroy {
    @Input() showTitle: boolean;
    
    _issueKey: any;
    @Input() set issueKey(value: any) {
        this._issueKey = value;
        this.loadComments();
    }
    get issueKey() { return this._issueKey; }

    comments$: Subscription;
    comments: any;
    loading = false;
    constructor(public store$: Store<CommonState>) {
    }

    ngOnInit(): void {
        this.comments$ = this.store$.select(p => p.common.comments)
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

    isEditorVisible = false;
    newComment = '';
    canAdd = () => this.newComment && this.newComment.trim().length > 0;

    add() {
        if (this.canAdd()) {
            this.store$.dispatch(new AddCommentAction({ key: this.issueKey, comment: this.newComment }));
            this.newComment = '';
        }
    }
    onCancel(event) {
        event.preventDefault();
        event.stopPropagation();
        this.newComment = ''
        this.isEditorVisible = false;
    }

    showEditor() {
        this.isEditorVisible = true;
    }

}
