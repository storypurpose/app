import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription, Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, searchTreeByKey, populateFieldValues } from 'src/app/lib/jira-tree-utils';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { ActivatedRoute } from '@angular/router';
import { AppState } from 'src/app/+state/app.state';
import { JiraService } from 'src/app/lib/jira.service';
import { SetStoryboardItemAction } from '../+state/storyboarding.actions';

const NO_COMPONENT = 'No component';
const BACKLOG_SPRINT = 'Backlog';
@Component({
    selector: 'app-storyboard-container',
    templateUrl: './container.component.html'
})
export class StoryboardingContainerComponent implements OnInit, OnDestroy {
    includeRelatedIssues = false;
    includeEpicChildren = false;
    relatedIssuesIncluded = false;
    epicChildrenIncluded = false;
    showStatistics = false;

    epicChildrenLoadedQuery$: Observable<any>;
    issueQuery$: Observable<any>;
    paramsQuery$: Observable<any>;
    projectsQuery$: Observable<any>;

    combined$: Subscription;
    selectedItem$: Subscription;

    storyboardItem: any;
    metadata: any;
    projects: any;
    selectedItem: any;

    localNodeType: any;

    fieldlist = ['key', 'project', 'title', 'status', 'components', 'fixVersions', 'labels', 'issueType', 'linkType'];

    constructor(public activatedRoute: ActivatedRoute,
        public persistenceService: PersistenceService,
        public jiraService: JiraService,
        public store$: Store<AppState>
    ) {
    }
    ngOnInit(): void {
        this.localNodeType = CustomNodeTypes;

        this.epicChildrenLoadedQuery$ = this.store$.select(p => p.app.epicChildrenLoaded).pipe(filter(issue => issue === true));
        this.issueQuery$ = this.store$.select(p => p.app.hierarchicalIssue).pipe(filter(issue => issue));
        this.paramsQuery$ = this.activatedRoute.params.pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]));
        this.projectsQuery$ = this.store$.select(p => p.app.projects).pipe(filter(p => p))

        this.combined$ = combineLatest(this.issueQuery$, this.paramsQuery$, this.projectsQuery$, this.epicChildrenLoadedQuery$)
            .subscribe(([hierarchicalIssue, rpSelected, projects, loaded]) => {
                console.log(loaded);
                this.projects = projects;
                const selectedNode = searchTreeByKey(hierarchicalIssue, rpSelected);
                if (selectedNode) {

                    this.storyboardItem = _.pick(selectedNode, this.fieldlist);
                    this.storyboardItem.children = []
                    this.storyboardItem.metadata = this.initializeMetadata();

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

    mergeMetadata(left: any, right: any) {
        left.count += right.count;
        left.noComponentCount += right.noComponentCount;
        left.backlogCount += right.backlogCount;

        left.labels = _.union(left.labels, right.labels);
        left.components = _.union(left.components, right.components);
        left.fixVersions = _.union(left.fixVersions, right.fixVersions);
    }

    initializeMetadata() {
        return {
            count: 0,
            noComponentCount: 0,
            backlogCount: 0,

            labels: [],
            components: [],
            fixVersions: []
        }
    }
    private extractMetadata(records) {
        const record: any = this.initializeMetadata();
        if (records) {
            record.count = records ? records.length : 0;
            record.labels = _.union(_.flatten(_.map(records, p => p.labels)));
            record.components = _.orderBy(_.map(_.union(_.flatten(_.map(records, p => p.components))), (c) => { return { title: c, count: 0 }; }), 'title');
            record.components.unshift({ title: NO_COMPONENT, count: 0 });
            record.fixVersions = _.map(_.union(_.flatten(_.map(records, p => p.fixVersions))), (fv) => {
                const found = _.filter(records, p => _.includes(p.fixVersions, fv));
                return {
                    title: fv, expanded: true, count: found ? found.length : 0,
                    componentWise: _.map(record.components, c => {
                        const values = _.filter(found, f => (c.title === NO_COMPONENT)
                            ? f.components.length === 0
                            : _.includes(f.components, c.title));
                        c.count += values.length;
                        return {
                            component: c.title,
                            values: values
                        };
                    })
                };
            });
            record.fixVersions = _.orderBy(record.fixVersions, ['title'])
            const noComponent = _.find(record.components, { title: NO_COMPONENT });
            if (!noComponent || noComponent.count === 0) {
                _.remove(record.components, { title: NO_COMPONENT });
            } else {
                record.noComponentCount = noComponent.count;
            }
            const backlogFixVersion = _.find(record.fixVersions, { title: BACKLOG_SPRINT });
            if (backlogFixVersion) {
                record.backlogCount = backlogFixVersion.count;
            }
        }
        return record;
    }

    private populateStatistics(record) {
        const statusResultSet = _.mapValues(_.groupBy(_.map(record.children, 'status')), (s) => s.length);
        const issueTypeResultSet = _.mapValues(_.groupBy(_.map(record.children, 'issueType')), (s) => s.length);

        return {
            components: _.map(record.metadata.components, c => { return { key: c.title, count: c.count } }),
            status: Object.keys(statusResultSet).map((key) => { return { key, count: statusResultSet[key] }; }),
            issueTypes: Object.keys(issueTypeResultSet).map((key) => { return { key, count: issueTypeResultSet[key] }; })
        };
    }

    ngOnDestroy(): void {
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.selectedItem$ ? this.selectedItem$.unsubscribe() : null;
    }

    plotIssuesOnStoryboard() {
        this.storyboardItem.children = [];
        this.storyboardItem.metadata = this.initializeMetadata();

        if (this.includeEpicChildren && this.storyboardItem.epicChildren && this.storyboardItem.epicChildren.length > 0) {
            this.epicChildrenIncluded = true;
            this.storyboardItem.children = _.union(this.storyboardItem.children, this.storyboardItem.epicChildren)
            this.mergeMetadata(this.storyboardItem.metadata, this.extractMetadata(this.storyboardItem.epicChildren))
        }
        if (this.includeRelatedIssues && this.storyboardItem.relatedLinks && this.storyboardItem.relatedLinks.length > 0) {
            if (!this.storyboardItem.relatedLinksLoaded) {
                this.populateRelatedLinks();
            } else {
                this.relatedIssuesIncluded = true;
                this.storyboardItem.children = _.union(this.storyboardItem.children, this.storyboardItem.relatedLinks)
                this.mergeMetadata(this.storyboardItem.metadata, this.extractMetadata(this.storyboardItem.relatedLinks))
            }
        }

        this.storyboardItem.statistics = this.populateStatistics(this.storyboardItem);
        console.log(this.storyboardItem.statistics);
        this.store$.dispatch(new SetStoryboardItemAction(this.storyboardItem));
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
