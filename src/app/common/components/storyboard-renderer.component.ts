import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { AppState } from 'src/app/+state/app.state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    @Input() groupByColumn;
    @Output() itemSelected = new EventEmitter<any>();

    constructor(public router: Router, public store$: Store<AppState>) {
    }
    ngOnInit(): void {
        this.groupByColumn = this.groupByColumn || 'components';
        this.projects$ = this.store$.select(p => p.app.projects)
            .pipe(filter(p => p))
            .subscribe(list => this.projects = list);
    }
    ngOnDestroy(): void {
        this.projects$ ? this.projects$.unsubscribe() : null;
    }

    getItems(fixVersion, field) {
        if (!this.storyboardItem || !this.storyboardItem.children)
            return [];

        let records = [];
        if (fixVersion[this.groupByColumn]) {
            const found = _.find(fixVersion[this.groupByColumn], (p) => p.key === field.title);
            if (found) {
                records = found.values;
            }
        }
        return records;
    }

    navigate(issueKey) {
        const parentKey = this.storyboardItem.key || issueKey;
        this.itemSelected.emit({ parentKey, issueKey })
        //this.router.navigate(['/browse', parentKey, 'purpose', issueKey, 'details'])
    }
    expandCollapseAll() {
        this.expandedAll = !this.expandedAll;
        if (this.storyboardItem && this.storyboardItem.metadata && this.storyboardItem.metadata.fixVersions) {
            this.storyboardItem.metadata.fixVersions.forEach(u => u.expanded = this.expandedAll);
        }
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

            issue.memento = issue.memento || { fixVersions: [] };
            if (issue.fixVersions) {
                issue.fixVersions.forEach(fv => {
                    const exists = _.find(issue.memento.fixVersions, { id: fv });
                    if (!exists) {
                        const found = _.find(refProject.metadata.versions, { name: fv });
                        if (found) {
                            issue.memento.fixVersions.push({ id: found.name, name: `${found.name}` + (found.releaseDate ? ` (${found.releaseDate})` : '') });
                        }
                    }
                })
            }

            issue.isEditingFixversions = true;
        }
    }

    // onfixVersionsChanged(updatedValue, issue) {
    //     issue.isEditingFixversions = false;
    //     if (updatedValue) {
    //         this.fieldValueChange.emit({
    //             issueKey: issue.key, fieldName: 'fixVersions',
    //             updatedValue: _.map(updatedValue, u => { return { name: u.id } })
    //         });
    //     } else {
    //         issue.memento.fixVersions = [];
    //     }
    // }
}
