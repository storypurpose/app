import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../+state/app.state';
import { CustomNodeTypes } from 'src/app/lib/jira-tree-utils';
import { StoryboardingState } from '../+state/storyboarding.state';

@Component({
    selector: 'app-story-list',
    templateUrl: './story-list.component.html'
})
export class StoryListComponent implements OnInit, OnDestroy {
    storyboardItem$: Subscription;
    list: any;
    filteredItems: any

    componentStats: any;
    componentFilter = "all";
    statusStats: any;
    statusFilter = "all";
    issueTypeStats: any;
    issueTypeFilter = "all";
    hasExtendedFields = false;
    hideExtendedFields = true;

    constructor(public store$: Store<StoryboardingState>) {
    }
    ngOnInit(): void {
        this.storyboardItem$ = this.store$.select(p => p.storyboarding.storyboardItem).pipe(filter(p => p))
            .subscribe(selectedEpic => {
                if (selectedEpic.children && selectedEpic.children.length > 0) {
                    this.list = selectedEpic.children;
                    this.list.forEach(u => u.hideExtendedFields = true);
                    this.onFilterChanged();

                    this.componentStats = selectedEpic.statistics.components;
                    this.statusStats = selectedEpic.statistics.status;
                    this.issueTypeStats = selectedEpic.statistics.issueTypes;
                }
            });
    }

    ngOnDestroy(): void {
        this.storyboardItem$ ? this.storyboardItem$.unsubscribe() : null;
    }

    public onFilterChanged() {
        this.filteredItems = _.filter(this.list,
            (ci) => (!this.statusFilter || this.statusFilter === "all" || ci.status === this.statusFilter) &&
                (!this.issueTypeFilter || this.issueTypeFilter === "all" || ci.issueType === this.issueTypeFilter))

        if (this.componentFilter !== "all") {
            this.filteredItems = _.filter(this.filteredItems, p => _.includes(p.components, this.componentFilter));
        }
        this.filteredItems = _.orderBy(this.filteredItems, ['issueType', 'status']);
    }
    showHideExtendedFields() {
        this.hideExtendedFields = !this.hideExtendedFields;
        if (this.list) {
            this.list.forEach((u) => u.hideExtendedFields = this.hideExtendedFields);
        }
    }
}
