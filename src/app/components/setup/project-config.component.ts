import { Component, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { CachingService } from 'src/app/lib/caching.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleAnalyticsService } from 'src/app/lib/google-analytics.service';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { UpsertProjectAction, UpsertProjectBeginAction, DismissProjectSetupAction } from 'src/app/+state/app.actions';

@Component({
    selector: 'app-project-config',
    templateUrl: './project-config.component.html'
})
export class ProjectConfigComponent {
    @Output() close = new EventEmitter<any>();
    @Input() project: any;

    downloadJsonHref: any;

    constructor(public cachingService: CachingService,
        public sanitizer: DomSanitizer,
        public gaService: GoogleAnalyticsService,
        public store$: Store<AppState>) {
    }

    onSave() {
        this.store$.dispatch(new UpsertProjectBeginAction(null));
        this.gaService.eventEmitter("set_project_configuration", "configuration", "project_configuration", "key", this.project.key);
        this.project.isConfigured = true;
        this.store$.dispatch(new UpsertProjectAction(this.project));
        this.cachingService.setProjectDetails(this.project);
        console.log('this.project', this.project);
        this.onClose(false);
    }
    onClose(reload) {
        this.store$.dispatch(new DismissProjectSetupAction(this.project));
        this.close.emit(reload);
    }
    onReset() {
        this.onClose(true);
    }
}
