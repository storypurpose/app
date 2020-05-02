import { Component, Output, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../+state/app.state';
import { PersistenceService } from '../lib/persistence.service';
import { ModeTypes, SetModeAction, ToggleQueryEditorVisibilityAction } from '../+state/app.actions';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
    @Input() connectionDetails: any;
    @Input() isOnlineMode: boolean;
    @Output() modeChanged = new EventEmitter<any>();

    isCollapsed = true;
    allowOfflineMode = false;

    queryEditorVisible$: Subscription;
    searchVisible = false;

    constructor(public store$: Store<AppState>) {
        if (!environment.production) {
            this.allowOfflineMode = true;
        }
    }

    ngOnInit(): void {
        this.queryEditorVisible$ = this.store$.select(p => p.app.queryEditorVisible)
            .subscribe(show => this.searchVisible = show);

        // this.initiatizeModeState(this.persistenceService.getMode());
    }
    ngOnDestroy(): void {
        this.queryEditorVisible$ ? this.queryEditorVisible$.unsubscribe() : null;
    }

    onModeChange(isOnlineMode) {
        this.modeChanged.emit(isOnlineMode)
        // this.initiatizeModeState(isOnlineMode ? ModeTypes.Online : ModeTypes.Offline);
        // window.location.reload();
    }
    // initiatizeModeState(mode) {
    //     this.persistenceService.setMode(mode);
    //     this.store$.dispatch(new SetModeAction(mode));
    // }

    toggleSearchEditorVisibility() {
        this.store$.dispatch(new ToggleQueryEditorVisibilityAction(!this.searchVisible));
    }
}
