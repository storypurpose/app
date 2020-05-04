import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CachingService } from 'src/app/lib/caching.service';
import { JiraService } from 'src/app/lib/jira.service';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, populateFieldValues } from 'src/app/lib/jira-tree-utils';
import { filter } from 'rxjs/operators';
import { initializeMetadata, mergeMetadata, extractMetadata, populateStatistics } from 'src/app/lib/storyboard-utils';
import { IssueState } from '../+state/issue.state';

@Component({
    selector: 'app-storyboard',
    templateUrl: './storyboard.component.html'
})
export class StoryboardComponent implements OnInit, OnDestroy {
    includeRelatedIssues = false;
    includeEpicChildren = false;
    relatedIssuesIncluded = false;
    epicChildrenIncluded = false;
    showStatistics = false;

    selectedItem$: Subscription;
    storyboardItem: any;
    metadata: any;
    projects: any;
    selectedItem: any;

    localNodeType: any;

    fieldlist = ['key', 'project', 'title', 'status', 'components', 'fixVersions', 'labels', 'issueType', 'linkType'];

    constructor(public activatedRoute: ActivatedRoute,
        public cachingService: CachingService,
        public jiraService: JiraService,
        public store$: Store<IssueState>
    ) { }
    ngOnInit(): void {
        this.localNodeType = CustomNodeTypes;

        this.selectedItem$ = this.store$.select(p => p.issue.selectedItem)
            .pipe(filter(p => p))
            .subscribe(selectedItem => {
                const selectedNode = selectedItem;
                if (selectedNode) {

                    this.storyboardItem = _.pick(selectedNode, this.fieldlist);
                    this.storyboardItem.children = []
                    this.storyboardItem.metadata = initializeMetadata();

                    const relatedLinks = _.filter(selectedNode.children, { issueType: CustomNodeTypes.RelatedLink });
                    if (relatedLinks && relatedLinks.length > 0) {
                        relatedLinks.forEach((u) => {
                            if (u.children && u.children.length > 0) {
                                this.storyboardItem.relatedLinks = _.union(this.storyboardItem.relatedLinks,
                                    _.map(u.children, p => _.pick(p, this.fieldlist)));
                            }
                        })
                    }

                    if (selectedNode.issueType === CustomNodeTypes.Epic) {
                        const epicNode = _.find(selectedNode.children, { issueType: CustomNodeTypes.EpicChildren });
                        if (epicNode && epicNode.children && epicNode.children.length > 0) {
                            this.storyboardItem.epicChildren = _.map(_.clone(epicNode.children), p => _.pick(p, this.fieldlist));
                            this.includeEpicChildren = true;
                        }
                    } else {
                        this.includeRelatedIssues = true;
                    }
                    this.plotIssuesOnStoryboard();
                }
            })
    }

    ngOnDestroy(): void {
        this.selectedItem$ ? this.selectedItem$.unsubscribe() : null;
    }

    plotIssuesOnStoryboard() {
        this.storyboardItem.children = [];
        this.storyboardItem.metadata = initializeMetadata();

        if (this.includeEpicChildren) {
            if (this.storyboardItem.epicChildren && this.storyboardItem.epicChildren.length > 0) {
                this.epicChildrenIncluded = true;
                this.storyboardItem.children = _.union(this.storyboardItem.children, this.storyboardItem.epicChildren)
                mergeMetadata(this.storyboardItem.metadata, extractMetadata(this.storyboardItem.epicChildren));
            }
        }
        if (this.includeRelatedIssues && this.storyboardItem.relatedLinks && this.storyboardItem.relatedLinks.length > 0) {
            if (!this.storyboardItem.relatedLinksLoaded) {
                this.populateRelatedLinks();
            } else {
                this.relatedIssuesIncluded = true;
                this.storyboardItem.children = _.union(this.storyboardItem.children, this.storyboardItem.relatedLinks)
                mergeMetadata(this.storyboardItem.metadata, extractMetadata(this.storyboardItem.relatedLinks))
            }
        }

        this.storyboardItem.statistics = populateStatistics(this.storyboardItem);
    }

    private populateRelatedLinks() {
        const issueKeys = _.map(this.storyboardItem.relatedLinks, 'key');
        if (issueKeys && issueKeys.length > 0) {
            this.jiraService.executeJql(`key in (${_.join(issueKeys, ',')})`, 0, 100, ['components', 'labels', 'fixVersions'], 'epic-children.json')
                .subscribe((data: any) => {
                    if (data && data.issues) {
                        this.storyboardItem.relatedLinksLoaded = true;
                        const records = _.map(data.issues, (item) => _.pick(populateFieldValues(item), this.fieldlist));
                        this.storyboardItem.relatedLinks;
                        this.storyboardItem.relatedLinks.forEach(u => {
                            const found = _.find(records, { key: u.key });
                            if (found) {
                                u.labels = found.labels;
                                u.fixVersions = found.fixVersions;
                                u.component = found.component;
                            }
                        });

                        this.plotIssuesOnStoryboard();
                    }
                });
        }
    }
}
