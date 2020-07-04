import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, populatedFieldList } from 'src/app/lib/jira-tree-utils';
import { filter } from 'rxjs/operators';
import { initializeMetadata, mergeMetadata, extractMetadata, populateStatistics } from 'src/app/lib/statistics-utils';
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
    groupByColumn = "components";

    selectedItem$: Subscription;
    selectedItem: any;
    storyboardItem: any;

    constructor(public store$: Store<IssueState>) { }

    ngOnInit(): void {
        this.selectedItem$ = this.store$.select(p => p.issue.selectedIssue)
            .pipe(filter(p => p))
            .subscribe(selectedIssue => {
                this.storyboardItem = _.pick(selectedIssue, _.union(populatedFieldList, ['relatedLinks', 'epicChildren']));

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

    onGroupByColumnChanged() {
        this.plotIssuesOnStoryboard();
    }
    plotIssuesOnStoryboard() {
        this.storyboardItem.children = [];
        this.storyboardItem.metadata = initializeMetadata(this.groupByColumn);
        const filters = _.map(this.selectedStatuses, 'key');
        if (this.includeEpicChildren) {
            if (this.storyboardItem.epicChildren && this.storyboardItem.epicChildren.length > 0) {
                this.epicChildrenIncluded = true;

                const epicChildren = this.filterByStatus(this.storyboardItem.epicChildren, filters);
                this.storyboardItem.children = _.union(this.storyboardItem.children, epicChildren)
                mergeMetadata(this.storyboardItem.metadata, extractMetadata(epicChildren, this.groupByColumn), this.groupByColumn);
            }
        }
        if (this.includeRelatedIssues && this.storyboardItem.relatedLinks && this.storyboardItem.relatedLinks.length > 0) {
            this.relatedIssuesIncluded = true;
            const relatedLinks = this.filterByStatus(this.storyboardItem.relatedLinks, filters);
            this.storyboardItem.children = _.union(this.storyboardItem.children, relatedLinks)
            mergeMetadata(this.storyboardItem.metadata, extractMetadata(relatedLinks, this.groupByColumn), this.groupByColumn)
        }
        this.storyboardItem.statistics = populateStatistics(this.storyboardItem.metadata, this.storyboardItem.children, "Statistics", this.groupByColumn);
        if (this.storyboardItem.statistics && this.statusLookup && this.statusLookup.length === 0) {
            this.statusLookup = this.storyboardItem.statistics.status;
        }
    }

    private filterByStatus = (list, filters) =>
        (filters && filters.length > 0)
            ? _.filter(list, (r) => _.find(filters, f => f === r.status) !== undefined)
            : list;

    onSelectedStatusChange(eventArgs) {
        this.plotIssuesOnStoryboard();
    }

    issueDetailsVisible = false;
    issuelist: any;
    currentIndex = 0;

    public openIssueAtIndex(index) {
        this.issueDetailsVisible = true;
        this.currentIndex = index;
    }

    onItemSelected(eventArgs) {
        if (this.storyboardItem.children && eventArgs && eventArgs.issueKey) {
            const foundIndex = _.findIndex(this.storyboardItem.children, { key: eventArgs.issueKey });
            if (foundIndex >= 0) {
                this.openIssueAtIndex(foundIndex);
            }
        }
    }
    onFieldUpdated(eventArgs) {
        this.store$.dispatch(new UpdateFieldValueAction(eventArgs));
    }
}
