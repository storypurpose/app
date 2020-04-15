import { Component } from '@angular/core';
import * as _ from 'lodash';

import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { SetConnectionDetailsAction, SetOrganizationAction, LoadProjectsAction, SetExtendedHierarchyDetailsAction } from "../../+state/app.actions";
import { PersistenceService } from '../../lib/persistence.service';
import { AppState } from '../../+state/app.state';
import { Router } from '@angular/router';

@Component({
    selector: 'app-import-configuration',
    templateUrl: './import-configuration.component.html'
})
export class ImportConfigurationComponent {

    fileLoaded = false;
    configurations: any;

    selectConnectionDetails = false;
    selectProjects = false;
    selectOrganization = false;
    selectExtendedHierarchy = false;

    constructor(public persistenceService: PersistenceService,
        public messageService: MessageService,
        public router: Router,
        public store$: Store<AppState>) {
    }

    onFileUpload(args, configUploader) {
        const file = args.files && args.files.length === 1 ? args.files[0] : null; // FileList object
        if (file) {
            this.getConfigurations(file)
                .then((config) => {
                    this.configurations = config;
                    this.fileLoaded = true;
                }, (err) => {
                    this.messageService.add({
                        severity: 'error', detail: 'Error:' + err,
                        life: 5000, closable: true
                    });
                    configUploader.clear();
                }
                )
        }
    }

    confirmSelection() {
        if (this.configurations) {
            if (this.selectConnectionDetails) {
                this.store$.dispatch(new SetConnectionDetailsAction(this.configurations.connectionDetails));
                this.persistenceService.setConnectionDetails(this.configurations.connectionDetails);
            }
            if (this.selectOrganization) {
                this.store$.dispatch(new SetOrganizationAction(this.configurations.organization));
                this.persistenceService.setOrganization(this.configurations.organization);
            }
            if (this.selectExtendedHierarchy) {
                this.store$.dispatch(new SetExtendedHierarchyDetailsAction(this.configurations.extendedHierarchy));
                this.persistenceService.setExtendedHierarchy(this.configurations.extendedHierarchy);
            }
            if (this.selectProjects) {
                this.store$.dispatch(new LoadProjectsAction(this.configurations.projects));
                this.persistenceService.setProjects(this.configurations.projects);
            }

            this.messageService.add({
                severity: 'success',
                detail: `Configurations loaded successfully. ${this.selectConnectionDetails ? 'Setup user credentials' : ''}`,
                life: 5000, closable: true
            });

            this.router.navigate(['browse']);
        }
    }

    async getConfigurations(file: File) {
        return new Promise<any>((resolve, reject) => {
            var reader = new FileReader();

            reader.onload = (event: any) => {
                var data = event.target.result;
                try {
                    resolve(JSON.parse(data))
                } catch (ex) {
                    reject("Invalid file")
                }
            };
            reader.readAsText(file);
        });
    }
}
