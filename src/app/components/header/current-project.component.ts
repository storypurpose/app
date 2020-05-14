import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ConfigureProjectAction as ConfigureProjectAction, DismissProjectSetupAction } from 'src/app/+state/app.actions';

@Component({
    selector: 'app-current-project',
    templateUrl: './current-project.component.html'
})
export class CurrentProjectComponent implements OnInit, OnDestroy {
    currentProject$: Subscription;
    currentProject: any;

    projects$: Subscription;
    projects: any;

    constructor(public router: Router,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.projects$ = this.store$.select(p => p.app.projects)
            .pipe(filter(p => p))
            .subscribe(p => this.projects = p);

        this.currentProject$ = this.store$.select(p => p.app.currentProject)
            .pipe(filter(p => p))
            .subscribe(cp => this.currentProject = cp);
    }
    ngOnDestroy(): void {
        this.projects$ ? this.projects$.unsubscribe() : null;
        this.currentProject$ ? this.currentProject$.unsubscribe() : null;
    }
    showProjectSetup(project) {
        this.store$.dispatch(new ConfigureProjectAction(project));
    }
    dismissProjectSetup(project) {
        if (project) {
            project.isConfigured = true;
            this.store$.dispatch(new DismissProjectSetupAction(project));
        }
    }
}
