import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { CachingService } from 'src/app/lib/caching.service';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-storyboard-renderer',
    templateUrl: './storyboard-renderer.component.html'
})
export class StoryboardRendererComponent implements OnInit, OnDestroy {

    @Input() storyboardItem: any;
    expandedAll = true;

    projects$: Subscription;
    projects: any;

    constructor(public cachingService: CachingService,
        public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.projects$ = this.store$.select(p => p.app.projects)
            .pipe(filter(p => p))
            .subscribe(list => this.projects = list);
    }
    ngOnDestroy(): void {
        this.projects$ ? this.projects$.unsubscribe() : null;
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

    editFixversions(issue) {
        issue.updated = issue.updated || {};
        if (!issue.project.metadata || !issue.project.metadata.versions) {
            const refProject = _.find(this.projects, { key: issue.project.key });
            if (refProject && refProject.metadata) {
                issue.project.metadata = issue.project.metadata || {};
                issue.project.metadata.versions = refProject.metadata.versions;
            }
        }
        issue.isEditingFixversions = true;
    }

    onfixVersionChanged(eventArgs) {
        eventArgs.issue.isEditingFixversions = false;
        console.log('onfixVersionChanged', eventArgs);
    }
}
