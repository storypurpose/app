import { Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { Store } from '@ngrx/store';
import { AppState } from '../../+state/app.state';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-export-configuration',
    templateUrl: './export-configuration.component.html'
})
export class ExportConfigurationComponent implements OnInit, OnDestroy {
    configurations$: Subscription;
    configurations: any;

    downloadJsonHref: any;
    selectConnectionDetails = true;
    selectProjects = true;
    selectOrganization = true;
    selectExtendedHierarchy = true;

    selectionConfirmed = false;

    constructor(
        public activatedRoute: ActivatedRoute,
        public sanitizer: DomSanitizer,
        public store$: Store<AppState>) {

        this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," +
            encodeURIComponent(JSON.stringify({})));
    }
    ngOnInit(): void {
        this.configurations$ = this.store$.select(p => p.app)
            .pipe(filter((p: any) => p &&
                ((p.connectionDetails && p.connectionDetails.authenticationType) ||
                    (p.projects && p.projects.length > 0) ||
                    (p.extendedHierarchy && p.extendedHierarchy.length > 0) ||
                    (p.organization && p.organization.name))),
                map((p: any) => {
                    return {
                        connectionDetails: _.pick(p.connectionDetails, ['authenticationType', 'serverUrl']),
                        projects: p.projects,
                        organization: p.organization,
                        extendedHierarchy: p.extendedHierarchy
                    }
                }))
            .subscribe(appState => this.configurations = _.cloneDeep(appState))
    }
    ngOnDestroy(): void {
        this.configurations$ ? this.configurations$.unsubscribe() : null;
    }

    confirmSelection() {
        const componentToExport = [];
        this.selectConnectionDetails ? componentToExport.push('connectionDetails') : null;
        this.selectProjects ? componentToExport.push('projects') : null;
        this.selectOrganization ? componentToExport.push('organization') : null;
        this.selectExtendedHierarchy ? componentToExport.push('extendedHierarchy') : null;

        const toSerialize = _.pick(this.configurations, componentToExport);
        var theJSON = JSON.stringify(toSerialize);
        this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));

        this.selectionConfirmed = true;
    }
}
