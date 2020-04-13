import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { PersistenceService } from '../lib/persistence.service';
import { MessageService } from 'primeng/api';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { ShowConnectionEditorAction, ModeTypes, SetConnectionDetailsAction, SetOrganizationDetailsAction, LoadProjectsAction } from '../+state/app.actions';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-workspace',
    templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit, OnDestroy {
    public connectionDetails: any;
    isOnlineMode = false;
    connectionDetailsSubscription: Subscription;

    constructor(public persistenceService: PersistenceService,
        public messageService: MessageService,
        public store$: Store<AppState>) {
    }

    ngOnInit() {
        this.store$.select(mode => mode.app.mode)
            .subscribe(mode => this.isOnlineMode = mode && mode === ModeTypes.Online);

        this.connectionDetailsSubscription = this.store$.select(p => p.app.connectionDetails)
            .subscribe(p => {
                this.connectionDetails = p;
                // if (this.connectionDetails && !this.connectionDetails.verified) {
                //     this.onShowSetup();
                // }
            });
    }
    ngOnDestroy(): void {
        this.connectionDetailsSubscription ? this.connectionDetailsSubscription.unsubscribe() : null;
    }

    onShowSetup() {
        this.store$.dispatch(new ShowConnectionEditorAction(true));
    }

    onFileUpload(args, configUploader) {

        const file = args.files && args.files.length === 1 ? args.files[0] : null; // FileList object
        if (file) {
            var reader = new FileReader();
            reader.onload = (function (file, ms, ps, store$) {
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

                            }
                        } catch (ex) {
                            ms.add({ severity: 'error', detail: 'Invalid file.' + ex.message, life: 5000, closable: true });
                        }
                    }

                    if (configUploader) {
                        configUploader.clear();
                    }
                };
            })(file, this.messageService, this.persistenceService, this.store$);

            reader.readAsText(file);
        }
    }

}
