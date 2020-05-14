import { Component, Input } from '@angular/core';
import * as _ from 'lodash';
import { CachingService } from 'src/app/lib/caching.service';

@Component({
    selector: 'app-issue-navigation-menu',
    templateUrl: './issue-navigation-menu.component.html'
})
export class IssueNavigationMenuComponent {
    @Input() parentIssueKey: string;
    @Input() issueKey: string;
    @Input() icon: string;
    @Input() placement: string;

    constructor(public cachingService: CachingService) {
    }
    prepareExternalUrl(issueKey) {
        const connectionDetails = this.cachingService.getConnectionDetails();

        return (connectionDetails && connectionDetails.serverUrl && connectionDetails.serverUrl.length > 0)
            ? `${connectionDetails.serverUrl}/browse/${issueKey}`
            : '';
    }
}
