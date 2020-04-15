import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { SetConnectionDetailsAction, SetOrganizationDetailsAction, LoadProjectsAction } from "../../+state/app.actions";
import { Subscription, pipe } from 'rxjs';
import { PersistenceService } from '../../lib/persistence.service';
import { AppState } from '../../+state/app.state';
import { Router, ActivatedRoute } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-configurations',
    templateUrl: './configurations.component.html'
})
export class ConfigurationsComponent implements OnInit, OnDestroy {
    configurations$: Subscription;
    configurations: any;

    queryparams$: Subscription;
    mode = "both";

    downloadJsonHref: any;
    selectConnectionDetails = true;
    selectProjects = true;
    selectionConfirmed = false;

    constructor(public persistenceService: PersistenceService,
        public messageService: MessageService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public sanitizer: DomSanitizer,
        public store$: Store<AppState>) {
    }

    ngOnInit(): void {
        this.queryparams$ = this.activatedRoute.queryParams
            .pipe(filter(p => p && p["mode"] && p["mode"].length > 0), map(p => p["mode"].toLowerCase()))
            .subscribe(p => this.mode = p);

        this.configurations$ = this.store$.select(p => p.app)
            .pipe(
                filter((p: any) => p && (p.connectionDetails || p.projects)),
                map((p: any) => {
                    return {
                        connectionDetails: _.pick(p.connectionDetails, ['authenticationType', 'serverUrl']),
                        projects: p.projects
                    }
                }),
                tap(p => console.log(p))
            )
            .subscribe(appState => {
                this.configurations = _.cloneDeep(appState);
                this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," +
                    encodeURIComponent(JSON.stringify({})));
            })
    }
    ngOnDestroy(): void {
        this.configurations$ ? this.configurations$.unsubscribe() : null;
        this.queryparams$ ? this.queryparams$.unsubscribe() : null;
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

    onFileUpload(args, configUploader) {

        const file = args.files && args.files.length === 1 ? args.files[0] : null; // FileList object
        if (file) {
            var reader = new FileReader();
            reader.onload = (function (file, router, ms, ps, store$) {
                return function (e) {
                    if (e.target.result) {
                        try {
                            const config = JSON.parse(e.target.result);
                            if (config) {
                                if (config.connectionDetails) {
                                    store$.dispatch(new SetConnectionDetailsAction(config.connectionDetails));
                                    ps.setConnectionDetails(config.connectionDetails);
                                }
                                if (config.organizationDetails) {
                                    store$.dispatch(new SetOrganizationDetailsAction(config.organizationDetails));
                                    ps.setOrganizationDetails(config.organizationDetails);
                                }
                                if (config.projects) {
                                    store$.dispatch(new LoadProjectsAction(config.projects));
                                    ps.setProjects(config.projects);
                                }

                                ms.add({
                                    severity: 'success', detail: 'Configurations loaded successfully. Setup user credentials',
                                    life: 5000, closable: true
                                });

                                router.navigate(['browse']);
                            }
                        } catch (ex) {
                            ms.add({ severity: 'error', detail: 'Invalid file.' + ex.message, life: 5000, closable: true });
                        }
                    }

                    if (configUploader) {
                        configUploader.clear();
                    }
                };
            })(file, this.router, this.messageService, this.persistenceService, this.store$);

            reader.readAsText(file);
        }
    }

}
