import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
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
    @Output() fieldValueChange = new EventEmitter<any>();

    @Input() storyboardItem: any;
    expandedAll = true;

    projects$: Subscription;
    projects: any;

    public zoom = 100;

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
        const refProject = _.find(this.projects, { key: issue.project.key });
        if (refProject) {
            if (!issue.project.metadata || !issue.project.metadata.versions) {
                if (refProject && refProject.metadata) {
                    issue.project.metadata = issue.project.metadata || {};
                    issue.project.metadata.versions = _.map(_.filter(refProject.metadata.versions, { archived: false }), (found) => {
                        return { id: found.name, name: `${found.name}` + (found.releaseDate ? ` (${found.releaseDate})` : '') };
                    });
                }
            }

            issue.updated = issue.updated || { fixVersions: [] };
            if (issue.fixVersions) {
                issue.fixVersions.forEach(fv => {
                    const exists = _.find(issue.updated.fixVersions, { id: fv });
                    if (!exists) {
                        const found = _.find(refProject.metadata.versions, { name: fv });
                        if (found) {
                            issue.updated.fixVersions.push({ id: found.name, name: `${found.name}` + (found.releaseDate ? ` (${found.releaseDate})` : '') });
                        }
                    }
                })
            }

            issue.isEditingFixversions = true;
        }
    }

    editTitle(item) {
        item.memento = { title: item.title };
        item.editTitle = true;
    }
    cancelEditTitle(item) {
        if (item.memento) {
            item.title = item.memento.title;
            item.memento.title = undefined;
        }
        item.editTitle = false;
    }
    onTitleChanged(issue) {
        this.fieldValueChange.emit({ issueKey: issue.key, fieldName: 'summary', updatedValue: issue.title });
        issue.editTitle = false;
    }

    onfixVersionsChanged(updatedValue, issue) {
        issue.isEditingFixversions = false;
        if (updatedValue) {
            this.fieldValueChange.emit({
                issueKey: issue.key, fieldName: 'fixVersions',
                updatedValue: _.map(updatedValue, u => { return { name: u.id } })
            });
        } else {
            issue.updated.fixVersions = [];
        }
    }
}
