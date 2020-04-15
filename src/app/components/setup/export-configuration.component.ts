import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

import { Store } from '@ngrx/store';
import { AppState } from '../../+state/app.state';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-export-configuration',
    templateUrl: './export-configuration.component.html'
})
export class ExportConfigurationComponent {
    @Input() configurations: any;

    downloadJsonHref: any;
    selectConnectionDetails = true;
    selectProjects = true;
    selectionConfirmed = false;

    constructor(
        public activatedRoute: ActivatedRoute,
        public sanitizer: DomSanitizer,
        public store$: Store<AppState>) {

        this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," +
            encodeURIComponent(JSON.stringify({})));
    }

    confirmSelection() {
        const componentToExport = [];
        this.selectConnectionDetails ? componentToExport.push('connectionDetails') : null;
        this.selectProjects ? componentToExport.push('projects') : null;

        const toSerialize = _.pick(this.configurations, componentToExport);
        var theJSON = JSON.stringify(toSerialize);
        this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));

        this.selectionConfirmed = true;
    }
}
