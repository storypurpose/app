import { Subscription } from "rxjs";
import { ChangeDetectorRef, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { IssueState } from '../../+state/issue.state';

export class ResizableContainerBase {

    containerSize = 0;
    expandableSize = 57;
    contentHeight = 0;
    @ViewChild('content') elementView: ElementRef;

    isSelectedIssueViewCompact$: Subscription;
    compactView = false;

    constructor(public cdRef: ChangeDetectorRef, public store$: Store<IssueState>) { }

    public init(containerSize) {
        this.containerSize = containerSize;
        this.isSelectedIssueViewCompact$ = this.store$.select(p => p.issue.isSelectedIssueViewCompact)
            .subscribe(isCompactView => {
                this.compactView = isCompactView;
                this.containerSize += isCompactView ? -1 * this.expandableSize : this.expandableSize;
                this.onResize();
            });
    }

    public destroy() {
        this.isSelectedIssueViewCompact$ ? this.isSelectedIssueViewCompact$.unsubscribe() : null;
    }

    public afterViewInit() {
        this.onResize();
    }
    @HostListener('window:resize', ['$event'])
    public onResize() {
        if (this.elementView) {
            this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - this.containerSize;
            this.cdRef.detectChanges();
        }
    }
}
