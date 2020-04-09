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

    fieldlist = ['key', 'project', 'title', 'components', 'fixVersions', 'labels', 'issueType'];

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
                        this.storyboardItem.labels = _.union(_.flatten(_.map(epicChildren.children, p => p.labels)));
                        this.storyboardItem.components = _.union(_.flatten(_.map(epicChildren.children, p => p.components)));
                        this.storyboardItem.fixVersions = _.union(_.flatten(_.map(epicChildren.children, p => p.fixVersions)));
                        this.store$.dispatch(new SetStoryboardItemAction(this.storyboardItem));
                    }
                }
            })
    }

    ngOnDestroy(): void {
        this.combined$ ? this.combined$.unsubscribe() : null;
        this.selectedItem$ ? this.selectedItem$.unsubscribe() : null;
    }

    private markIssueSelected(node: any) {
        if (node) {
            if (this.projects && node.project) {
                node.extendedFields = getExtendedFields(this.projects, node.project.key, node.issueType);
            }
            if (node.parent && node.parent.issueType === CustomNodeTypes.RelatedLink && (!node.description || node.description.length === 0)) {
                const fieldList = _.map(node.extendedFields, 'id');
                this.jiraService.getIssueDetails(node.key, fieldList)
                    .pipe(filter(p => p !== null && p !== undefined))
                    .subscribe((linkedIssue: any) => {
                        const loaded = populateFieldValues(linkedIssue);
                        if (loaded) {
                            copyFieldValues(loaded, node);
                        }

                        node.extendedFields = _.map(node.extendedFields, (ef) => {
                            ef.value = linkedIssue.fields[ef.id];
                            return ef;
                        });
                        // this.expandPurpose(node);
                    });
            } else {
                // this.expandPurpose(node);
            }
        }
    }

}
