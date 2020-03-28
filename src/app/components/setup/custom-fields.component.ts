import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import * as _ from 'lodash';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleAnalyticsService } from 'src/app/lib/google-analytics.service';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { SetFieldMappingAction } from 'src/app/+state/app.actions';

@Component({
    selector: 'app-custom-fields',
    templateUrl: './custom-fields.component.html'
})
export class CustomFieldsComponent implements OnInit {
    private _issueType: string;

    @Input()
    set issueType(value) {
        this._issueType = value;
        this.expandDefaultIssueType();
    }
    get issueType() { return this._issueType }

    @Output() close = new EventEmitter<any>();
    @Input() fieldMapping: any;

    downloadJsonHref: any;

    constructor(public jiraService: JiraService,
        public persistenceService: PersistenceService,
        public sanitizer: DomSanitizer,
        public gaService: GoogleAnalyticsService,
        public store$: Store<AppState>) {
    }

    ngOnInit() {
        this.expandDefaultIssueType();
        this.store$.select(p => p.app)
            .subscribe(appState => {
                var theJSON = JSON.stringify(appState);
                var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
                this.downloadJsonHref = uri;
            })
    }

    addIssueTypeConfiguration() {
        this.fieldMapping.issueTypes.push({ name: '', list: [] });
    }
    removeIssueTypeConfiguration(index) {
        this.fieldMapping.issueTypes.splice(index, 1);
    }

    onSave() {
        this.gaService.eventEmitter("set_field_mapping", "configuration", "field_mapping");
        this.persistenceService.setFieldMapping(this.fieldMapping);
        this.store$.dispatch(new SetFieldMappingAction(this.fieldMapping));
        this.onClose(false);

        // this.onClose(true);
    }
    onClose(reload) {
        this.close.emit(reload);
    }
    onReset() {
        this.persistenceService.resetFieldMapping();
        this.onClose(true);
    }

    expandDefaultIssueType() {
        if (this.fieldMapping && this.fieldMapping.issueTypes && this.issueType && this.issueType.length > 0) {
            this.fieldMapping.issueTypes.forEach(it => it.hide = true);
            const found = _.find(this.fieldMapping.issueTypes, { name: this.issueType });
            if (found) {
                found.hide = false;
            } else {
                this.fieldMapping.issueTypes.push({ name: this.issueType, list: [], hide: false })
            }
        }
    }
}
