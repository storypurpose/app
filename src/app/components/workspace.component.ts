import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { PersistenceService } from '../lib/persistence.service';
import { MessageService } from 'primeng/api';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { ShowConnectionEditorAction } from '../+state/app.actions';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-workspace',
    templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit, OnDestroy {
    public connectionDetails: any;

    connectionDetailsSubscription: Subscription;

    constructor(public persistenceService: PersistenceService,
        public messageService: MessageService,
        public store$: Store<AppState>) {
    }

    ngOnInit() {
        this.connectionDetailsSubscription = this.store$.select(p => p.app.connectionDetails)
            .subscribe(p => this.connectionDetails = p);
        // this.connectionDetails = this.persistenceService.get1ConnectionDetails();
    }
    ngOnDestroy(): void {
        this.connectionDetailsSubscription ? this.connectionDetailsSubscription.unsubscribe() : null;
    }

    onShowSetup() {
        this.store$.dispatch(new ShowConnectionEditorAction(true));
    }

    handleConfigFileUpload(args, configUploader) {
        const file = args.files && args.files.length === 1 ? args.files[0] : null; // FileList object
        if (file) {
            var reader = new FileReader();
            reader.onload = (function (file, ms, ps) {
                return function (e) {
                    if (e.target.result) {
                        try {
                            const config = JSON.parse(e.target.result);
                            if (config) {
                                if (config.connectionDetails) ps.setConnectionDetails(config.connectionDetails);
                                if (config.organizationDetails) ps.setOrganizationDetails(config.organizationDetails);
                                if (config.fieldMapping) ps.setFieldMapping(config.fieldMapping);

                                ms.add({
                                    severity: 'success', detail: 'Configurations loaded successfully. Setup user credentials',
                                    life: 5000, closable: true
                                });

                                window.location.reload();
                            }
                        } catch (ex) {
                            ms.add({ severity: 'error', detail: 'Invalid file.' + ex.message, life: 5000, closable: true });
                        }
                    }


                    if (configUploader) {
                        configUploader.clear();
                    }
                };
            })(file, this.messageService, this.persistenceService);

            reader.readAsText(file);
        }
    }

}
