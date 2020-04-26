import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleAnalyticsService } from 'src/app/lib/google-analytics.service';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { UpsertProjectAction, UpsertProjectBeginAction } from 'src/app/+state/app.actions';

@Component({
    selector: 'app-project-config',
    templateUrl: './project-config.component.html'
})
export class ProjectConfigComponent implements OnInit {

    @Output() close = new EventEmitter<any>();
    @Input() project: any;

    downloadJsonHref: any;

    constructor(
        public persistenceService: PersistenceService,
        public sanitizer: DomSanitizer,
        public gaService: GoogleAnalyticsService,
        public store$: Store<AppState>) {
    }

    ngOnInit() {
        // this.store$.select(p => p.app)
        //     .pipe(map(p => { return { connectionDetails: p.connectionDetails, projects: p.projects } }))
        //     .subscribe(appState => {
        //         const configurations = _.cloneDeep(appState);
        //         if (configurations && configurations.connectionDetails) {
        //             configurations.connectionDetails.password = null;
        //             configurations.connectionDetails.username = null;

        //             configurations.connectionDetails.displayName = undefined;
        //             configurations.connectionDetails.encoded = undefined;
        //             configurations.connectionDetails.verified = undefined;
        //         }
        //         var theJSON = JSON.stringify(configurations);
        //         var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
        //         this.downloadJsonHref = uri;
        //     })
    }

    onSave() {
        this.store$.dispatch(new UpsertProjectBeginAction(null));
        this.gaService.eventEmitter("set_project_configuration", "configuration", "project_configuration", "key", this.project.key);
        this.project.isConfigured = true;
        this.store$.dispatch(new UpsertProjectAction(this.project));
        this.persistenceService.setProjectDetails(this.project);

        this.onClose(false);
    }
    onClose(reload) {
        this.close.emit(reload);
    }
    onReset() {
        this.onClose(true);
    }
}
