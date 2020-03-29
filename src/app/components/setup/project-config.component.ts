import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import * as _ from 'lodash';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleAnalyticsService } from 'src/app/lib/google-analytics.service';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { UpsertProjectAction } from 'src/app/+state/app.actions';

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

    }

    onSave() {
        this.gaService.eventEmitter("set_project_configuration", "configuration", "project_configuration", "key", this.project.key);
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
