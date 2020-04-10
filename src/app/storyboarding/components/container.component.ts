import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription, Observable, combineLatest } from 'rxjs';
import { filter, map, debounce, debounceTime } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, searchTreeByKey, copyFieldValues, populateFieldValues, searchTreeByIssueType } from 'src/app/lib/jira-tree-utils';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { ActivatedRoute } from '@angular/router';
import { AppState } from 'src/app/+state/app.state';
import { getExtendedFields } from 'src/app/lib/project-config.utils';
import { JiraService } from 'src/app/lib/jira.service';
import { SetStoryboardItemAction } from '../+state/storyboarding.actions';
import { ChartOptions } from 'chart.js';

const NO_COMPONENT = 'No component';
@Component({
    selector: 'app-storyboard-container',
    templateUrl: './container.component.html'
})
export class StoryboardingContainerComponent implements OnInit, OnDestroy {

    epicChildrenLoadedQuery$: Observable<any>;
    issueQuery$: Observable<any>;
    paramsQuery$: Observable<any>;
    projectsQuery$: Observable<any>;

    combined$: Subscription;
    selectedItem$: Subscription;

    storyboardItem: any;
    projects: any;
    selectedItem: any;

    localNodeType: any;

    fieldlist = ['key', 'project', 'title', 'status', 'components', 'fixVersions', 'labels', 'issueType'];

    public chartLabels: any; // = ['Sales Q1', 'Sales Q2', 'Sales Q3', 'Sales Q4'];
    public chartData: any; // = [120, 150, 180, 90];
    public chartOptions: ChartOptions = {
        responsive: true,
        tooltips: { enabled: false },
        legend: { position: 'right' },
        plugins: {
            labels: [
                {
                    render: 'value',
                    fontColor: '#000'
                }]
        }
    };

    constructor(public activatedRoute: ActivatedRoute,
        public persistenceService: PersistenceService,
        public jiraService: JiraService,
        public store$: Store<AppState>
    ) {
    }
    ngOnInit(): void {
        this.localNodeType = CustomNodeTypes;

        this.selectedItem$ = this.store$.select(p => p.purpose.selectedItem).pipe(filter(p => p))
            .subscribe(p => this.selectedItem = p);

        this.epicChildrenLoadedQuery$ = this.store$.select(p => p.app.epicChildrenLoaded).pipe(filter(issue => issue === true));
        this.issueQuery$ = this.store$.select(p => p.app.hierarchicalIssue).pipe(filter(issue => issue));
        this.paramsQuery$ = this.activatedRoute.params.pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]));
        this.projectsQuery$ = this.store$.select(p => p.app.projects).pipe(filter(p => p))

        this.combined$ = combineLatest(this.issueQuery$, this.paramsQuery$, this.projectsQuery$, this.epicChildrenLoadedQuery$)
            .subscribe(([hierarchicalIssue, rpSelected, projects, epicChildrenLoaded]) => {
                this.projects = projects;
                const selectedNode = searchTreeByKey(hierarchicalIssue, rpSelected);
                if (selectedNode && selectedNode.issueType === CustomNodeTypes.Epic) {

                    this.storyboardItem = _.pick(selectedNode, this.fieldlist);

                    const epicChildren = _.find(selectedNode.children, { issueType: CustomNodeTypes.EpicChildren });
                    if (epicChildren && epicChildren.children) {
                        this.storyboardItem.children = _.map(_.clone(epicChildren.children), p => _.pick(p, this.fieldlist));

                        const statusResultSet = _.mapValues(_.groupBy(_.map(this.storyboardItem.children, 'status')), (s) => s.length);
                        this.storyboardItem.statistics = Object.keys(statusResultSet).map((key) => { return { key, count: statusResultSet[key] } });

                        this.chartLabels = _.map(this.storyboardItem.statistics, s => `${s.key} (${s.count})`);
                        this.chartData = _.map(this.storyboardItem.statistics, 'count');

                        console.log(this.storyboardItem.statistics, this.chartLabels, this.chartData);

                        this.storyboardItem.count = this.storyboardItem.children ? this.storyboardItem.children.length : 0;

                        this.storyboardItem.labels = _.union(_.flatten(_.map(epicChildren.children, p => p.labels)));

                        this.storyboardItem.components = _.orderBy(_.map(_.union(_.flatten(_.map(epicChildren.children, p => p.components))),
                            (c) => { return { title: c, count: 0 } }), 'title');

                        this.storyboardItem.components.unshift({ title: NO_COMPONENT, count: 0 });

                        this.storyboardItem.fixVersions = _.map(_.union(_.flatten(_.map(epicChildren.children, p => p.fixVersions))),
                            (fv) => {
                                const found = _.filter(epicChildren.children, p => _.includes(p.fixVersions, fv))

                                return {
                                    title: fv, expanded: true, count: found ? found.length : 0,
                                    componentWise: _.map(this.storyboardItem.components, c => {

                                        const values = _.filter(found, f => (c.title === NO_COMPONENT)
                                            ? f.components.length === 0
                                            : _.includes(f.components, c.title));
                                        c.count += values.length;
                                        return {
                                            component: c.title,
                                            values: values
                                        }
                                    })
                                }
                            });
                        const found = _.find(this.storyboardItem.components, { title: NO_COMPONENT })
                        console.log(found);
                        if (!found || found.count === 0) {
                            _.remove(this.storyboardItem.components, { title: NO_COMPONENT });
                        }

                        this.store$.dispatch(new SetStoryboardItemAction(this.storyboardItem));
                    }
                }
            })
    }

    ngOnDestroy(): void {
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.selectedItem$ ? this.selectedItem$.unsubscribe() : null;
    }
}
