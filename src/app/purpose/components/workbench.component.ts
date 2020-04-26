import { Component, Input, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { filter } from 'rxjs/operators';
import { Subscription, combineLatest } from 'rxjs';

@Component({
    selector: 'app-workbench',
    templateUrl: './workbench.component.html'
})
export class WorkbenchComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input() issue: any;
    combined$: Subscription;
    contentHeight = 0;
    @ViewChild('content') elementView: ElementRef;

    constructor(public cdRef: ChangeDetectorRef, public store$: Store<AppState>) {
    }

    ngOnInit(): void {
        const issueQuery = this.store$.select(p => p.purpose.selectedItem).pipe(filter(p => p));
        const projectsQuery = this.store$.select(p => p.app.projects);
        this.combined$ = combineLatest(issueQuery, projectsQuery)
            .subscribe(([issue, projects]) => {
                this.issue = issue;
                this.issue.project = _.find(projects, { key: this.issue.project.key })
            });
    }

    ngOnDestroy(): void {
        this.combined$ ? this.combined$.unsubscribe() : null;
    }

    ngAfterViewInit(): void {
        this.contentHeight = this.elementView.nativeElement.offsetParent.clientHeight - 134;
        this.cdRef.detectChanges();
    }
}
