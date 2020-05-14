import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, populatedFieldList } from 'src/app/lib/jira-tree-utils';
import { filter } from 'rxjs/operators';
import { initializeMetadata, mergeMetadata, extractMetadata, populateStatistics } from 'src/app/lib/storyboard-utils';
import { IssueState } from '../../+state/issue.state';
import { UpdateFieldValueAction } from '../../+state/issue.actions';

@Component({
    selector: 'app-storyboard',
    templateUrl: './storyboard.component.html'
})
export class StoryboardComponent implements OnInit, OnDestroy {
    selectedStatuses: any = [];
    statusLookup = [];

    includeRelatedIssues = false;
    relatedIssuesIncluded = false;

    includeEpicChildren = false;
    epicChildrenIncluded = false;

    showStatistics = false;

    selectedItem$: Subscription;
    selectedItem: any;

    storyboardItem: any;

    constructor(public store$: Store<IssueState>) { }

    ngOnInit(): void {
        this.selectedItem$ = this.store$.select(p => p.issue.selectedIssue)
            .pipe(filter(p => p))
            .subscribe(selectedIssue => {
                this.storyboardItem = _.pick(selectedIssue, _.union(populatedFieldList, ['relatedLinks', 'epicChildren']));
                this.storyboardItem.children = []
                this.storyboardItem.metadata = initializeMetadata();

                if (selectedIssue.issueType === CustomNodeTypes.Epic) {
                    this.includeEpicChildren = true;
                } else {
                    this.includeRelatedIssues = true;
                }
                this.plotIssuesOnStoryboard();
            })
    }

    ngOnDestroy(): void {
        this.selectedItem$ ? this.selectedItem$.unsubscribe() : null;
    }

    plotIssuesOnStoryboard() {
        this.storyboardItem.children = [];
        this.storyboardItem.metadata = initializeMetadata();

        const filters = _.map(this.selectedStatuses, 'key');
        if (this.includeEpicChildren) {
            if (this.storyboardItem.epicChildren && this.storyboardItem.epicChildren.length > 0) {
                this.epicChildrenIncluded = true;

                const epicChildren = this.filterByStatus(this.storyboardItem.epicChildren, filters);
                this.storyboardItem.children = _.union(this.storyboardItem.children, epicChildren)
                mergeMetadata(this.storyboardItem.metadata, extractMetadata(epicChildren));
            }
        }
        if (this.includeRelatedIssues && this.storyboardItem.relatedLinks && this.storyboardItem.relatedLinks.length > 0) {
            this.relatedIssuesIncluded = true;
            const relatedLinks = this.filterByStatus(this.storyboardItem.relatedLinks, filters);
            this.storyboardItem.children = _.union(this.storyboardItem.children, relatedLinks)
            mergeMetadata(this.storyboardItem.metadata, extractMetadata(relatedLinks))
        }
        this.storyboardItem.statistics = populateStatistics(this.storyboardItem);
        if (this.storyboardItem.statistics && this.statusLookup && this.statusLookup.length === 0) {
            this.statusLookup = this.storyboardItem.statistics.status;
        }
    }

    private filterByStatus = (list, filters) =>
        (filters && filters.length > 0)
            ? _.filter(list, (r) => _.find(filters, f => f === r.status) !== undefined)
            : list;

    onFieldValueChanged(eventArgs) {
        this.store$.dispatch(new UpdateFieldValueAction(eventArgs));
    }

    onSelectedStatusChange(eventArgs) {
        this.plotIssuesOnStoryboard();
    }
}
