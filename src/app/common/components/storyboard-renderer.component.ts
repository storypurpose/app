import { Component, Input } from '@angular/core';
import * as _ from 'lodash';
import { CachingService } from 'src/app/lib/caching.service';

@Component({
    selector: 'app-storyboard-renderer',
    templateUrl: './storyboard-renderer.component.html'
})
export class StoryboardRendererComponent {

    @Input() storyboardItem: any;
    expandedAll = true;

    constructor(public cachingService: CachingService) {
    }

    getItems(fixVersion, component) {
        if (!this.storyboardItem || !this.storyboardItem.children)
            return [];

        let records = [];
        if (fixVersion.componentWise) {
            const found = _.find(fixVersion.componentWise, { component: component.title });
            if (found) {
                records = found.values;
            }
        }
        return records;
    }

    expandCollapseAll() {
        this.expandedAll = !this.expandedAll;
        if (this.storyboardItem && this.storyboardItem.metadata && this.storyboardItem.metadata.fixVersions) {
            this.storyboardItem.metadata.fixVersions.forEach(u => u.expanded = this.expandedAll);
        }
    }

    prepareExternalUrl(issueKey) {
        const connectionDetails = this.cachingService.getConnectionDetails();

        return (connectionDetails && connectionDetails.serverUrl && connectionDetails.serverUrl.length > 0)
            ? `${connectionDetails.serverUrl}/browse/${issueKey}`
            : '';
    }
}
