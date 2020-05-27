import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SwitchSearchresultViewmodeAction, SearchresultViewMode } from '../+state/search.actions';
import { SearchState } from '../+state/search.state';

@Component({
    selector: 'app-roadmap-view',
    templateUrl: './roadmap-view.component.html'
})
export class SearchRoadmapViewComponent implements OnInit, OnDestroy, AfterViewInit {
    issuelist$: Subscription;
    issuelist: any;

    containerSize = 80;
    contentHeight = 0;
    @ViewChild('content') elementView: ElementRef;

    public constructor(public cdRef: ChangeDetectorRef,
        public activatedRoute: ActivatedRoute,
        public store$: Store<SearchState>) {
    }

    ngOnInit(): void {
        this.store$.dispatch(new SwitchSearchresultViewmodeAction(SearchresultViewMode.STORYBOARD));

        this.issuelist$ = this.store$.select(p => p.search.issuelist)
            .pipe(filter(p => p))
            .subscribe(list => {
                this.issuelist = list;
                console.log(this.issuelist);
            });
    }

    ngOnDestroy(): void {
        this.issuelist$ ? this.issuelist$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
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
