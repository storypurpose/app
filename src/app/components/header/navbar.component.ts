import { Component, Output, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../+state/app.state';
import { ToggleQueryEditorVisibilityAction, ConfigureProjectAction } from '../../+state/app.actions';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
    @Input() connectionDetails: any;
    @Input() isOnlineMode: boolean;
    @Output() modeChanged = new EventEmitter<any>();

    isCollapsed = true;
    allowOfflineMode = false;

    queryEditorVisible$: Subscription;
    searchVisible = false;

    projectToConfigure$: Subscription;
    projectToConfigure: any;

    projectConfigEditorVisible$: Subscription;
    showProjectConfigEditor = false;

    constructor(public store$: Store<AppState>) {
        if (!environment.production) {
            this.allowOfflineMode = true;
        }
    }

    ngOnInit(): void {
        this.queryEditorVisible$ = this.store$.select(p => p.app.queryEditorVisible)
            .subscribe(show => this.searchVisible = show);

        this.projectToConfigure$ = this.store$.select(p => p.app.projectToConfigure)
            .pipe(filter(p => p))
            .subscribe(p => this.projectToConfigure = p);

        this.projectConfigEditorVisible$ = this.store$.select(p => p.app.projectConfigEditorVisible)
            .subscribe(p => this.showProjectConfigEditor = p);
    }
    ngOnDestroy(): void {
        this.projectToConfigure$ ? this.projectToConfigure$.unsubscribe() : null;
        this.projectConfigEditorVisible$ ? this.projectConfigEditorVisible$.unsubscribe() : null;
        this.queryEditorVisible$ ? this.queryEditorVisible$.unsubscribe() : null;
    }

    onModeChange(isOnlineMode) {
        this.modeChanged.emit(isOnlineMode)
    }

    toggleSearchEditorVisibility() {
        this.store$.dispatch(new ToggleQueryEditorVisibilityAction(!this.searchVisible));
    }

    projectConfigSetupCompleted(reload) {
        this.store$.dispatch(new ConfigureProjectAction(null));
        if (reload) {
            window.location.reload();
        }
    }
}
