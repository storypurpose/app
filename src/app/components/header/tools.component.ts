import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { ShowConnectionEditorAction, ConfigureProjectAction } from '../../+state/app.actions';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html'
})
export class ToolsComponent implements OnInit, OnDestroy {
    // public projects$: Subscription;
    // public projects: any;
    constructor(public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        // this.projects$ = this.store$.select(p => p.app.projects).pipe(filter(p => p))
        //     .subscribe(p => this.projects = p);
    }
    ngOnDestroy(): void {
        // this.projects$ ? this.projects$.unsubscribe() : null;
    }

    openConnectionDetailEditor() {
        this.store$.dispatch(new ShowConnectionEditorAction(true));
    }

    // showProjectSetup(project) {
    //     this.store$.dispatch(new ShowProjectConfigEditorAction(project));
    // }
}