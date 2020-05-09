import { Component, Input } from '@angular/core';
import * as _ from 'lodash';
import { CachingService } from 'src/app/lib/caching.service';

@Component({
    selector: 'app-issue-navigation',
    templateUrl: './issue-navigation.component.html'
})
export class IssueNavigationComponent {
    @Input() parentIssueKey: string;
    @Input() issueKey: string;
    constructor(public cachingService: CachingService) {
    }
    prepareExternalUrl(issueKey) {
        const connectionDetails = this.cachingService.getConnectionDetails();

        return (connectionDetails && connectionDetails.serverUrl && connectionDetails.serverUrl.length > 0)
            ? `${connectionDetails.serverUrl}/browse/${issueKey}`
            : '';
    }
}
