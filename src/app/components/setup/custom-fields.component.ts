import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import * as _ from 'lodash';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleAnalyticsService } from 'src/app/lib/google-analytics.service';

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
    customFieldMaping: any;

    configurations: any;
    downloadJsonHref: any;

    constructor(public jiraService: JiraService, public persistenceService: PersistenceService, public sanitizer: DomSanitizer,
        public gaService: GoogleAnalyticsService) {

    }

    ngOnInit() {
        this.customFieldMaping = this.persistenceService.getFieldMapping();
        this.expandDefaultIssueType();
        this.configurations = {};
        this.configurations.connectionDetails = this.persistenceService.getConnectionDetails() || {};
        this.configurations.connectionDetails.password = null;
        this.configurations.connectionDetails.username = null;
        this.configurations.connectionDetails.encoded = undefined;
        this.configurations.connectionDetails.offlineMode = undefined;

        this.configurations.fieldMapping = this.customFieldMaping;
        this.configurations.organizationDetails = this.persistenceService.getOrganizationDetails() || {};

        this.generateDownloadJsonUri();
    }

    generateDownloadJsonUri() {
        var theJSON = JSON.stringify(this.configurations);
        var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
        this.downloadJsonHref = uri;
    }

    addIssueTypeConfiguration() {
        this.customFieldMaping.issueTypes.push({ name: '', list: [] });
    }
    removeIssueTypeConfiguration(index) {
        this.customFieldMaping.issueTypes.splice(index, 1);
    }

    onSave() {
        this.gaService.eventEmitter("set_field_mapping", "configuration", "field_mapping");
        this.persistenceService.setFieldMapping(this.customFieldMaping);
        this.onClose();
    }
    onClose() {
        this.close.emit(true);
    }
    onReset() {
        this.persistenceService.resetFieldMapping();
        this.onClose();
    }

    expandDefaultIssueType() {
        if (this.customFieldMaping && this.customFieldMaping.issueTypes && this.issueType && this.issueType.length > 0) {
            this.customFieldMaping.issueTypes.forEach(it => it.hide = true);
            const found = _.find(this.customFieldMaping.issueTypes, { name: this.issueType });
            if (found) {
                found.hide = false;
            } else {
                this.customFieldMaping.issueTypes.push({ name: this.issueType, list: [], hide: false })
            }
        }
    }
}
