import { Component } from '@angular/core';
import * as _ from 'lodash';

import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { SetConnectionDetailsAction, SetOrganizationDetailsAction, LoadProjectsAction } from "../../+state/app.actions";
import { PersistenceService } from '../../lib/persistence.service';
import { AppState } from '../../+state/app.state';
import { Router } from '@angular/router';

@Component({
    selector: 'app-import-configuration',
    templateUrl: './import-configuration.component.html'
})
export class ImportConfigurationComponent {
    constructor(public persistenceService: PersistenceService,
        public messageService: MessageService,
        public router: Router,
        public store$: Store<AppState>) {
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
