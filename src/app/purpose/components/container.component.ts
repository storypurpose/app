import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from "lodash";
import { Subscription, Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomNodeTypes, searchTreeByKey, copyFieldValues, populateFieldValues, searchTreeByIssueType } from 'src/app/lib/jira-tree-utils';
import { PersistenceService } from 'src/app/lib/persistence.service';
import { SetPurposeAction, SetSelectedItemAction } from '../+state/purpose.actions';
import { ActivatedRoute } from '@angular/router';
import { AppState } from 'src/app/+state/app.state';
import { getExtendedFields } from 'src/app/lib/project-config.utils';
import { JiraService } from 'src/app/lib/jira.service';

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html'
})
export class SelectedItemContainerComponent implements OnInit, OnDestroy {

    issueQuery$: Observable<any>;
    paramsQuery$: Observable<any>;
    projectsQuery$: Observable<any>;

    combined$: Subscription;
    selectedItem$: Subscription;

    purpose: any;
    projects: any;
    selectedItem: any;

    localNodeType: any;
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

        this.issueQuery$ = this.store$.select(p => p.app.hierarchicalIssue).pipe(filter(issue => issue));
        this.paramsQuery$ = this.activatedRoute.params.pipe(filter(p => p && p["selected"] && p["selected"].length > 0), map(p => p["selected"]));
        this.projectsQuery$ = this.store$.select(p => p.app.projects).pipe(filter(p => p))

        this.combined$ = combineLatest(this.issueQuery$, this.paramsQuery$, this.projectsQuery$)
            .subscribe(([hierarchicalIssue, rpSelected, projects]) => {
                this.projects = projects;
                const currentProject = searchTreeByIssueType(hierarchicalIssue, CustomNodeTypes.Project);
                const selectedNode = searchTreeByKey(hierarchicalIssue, rpSelected);
                if (currentProject && selectedNode) {
                    selectedNode.extendedFields = getExtendedFields(this.projects, currentProject.key, selectedNode.issueType);
                    const fieldList = _.map(selectedNode.extendedFields, 'id');
                    this.jiraService.getIssueDetails(rpSelected, fieldList)
                        .pipe(filter((p: any) => p !== null && p !== undefined && p.fields))
                        .subscribe((issuedetails: any) => {

                            copyFieldValues(populateFieldValues(issuedetails), selectedNode);

                            selectedNode.extendedFields = _.map(selectedNode.extendedFields, (ef) => {
                                ef.value = issuedetails.fields[ef.id];
                                return ef;
                            });

                            const temp = _.pick(selectedNode,
                                ['key', 'label', 'title', 'issueType', 'project', 'status', 'description',
                                    'components', 'labels', 'fixVersions', 'extendedFields', 'children']);

                            this.store$.dispatch(new SetSelectedItemAction(temp));
                        });

                }
                setTimeout(() => this.markIssueSelected(selectedNode), 500);
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
                        this.expandPurpose(node);
                    });
            } else {
                this.expandPurpose(node);
            }
        }
    }

    public expandPurpose(node: any) {
        this.purpose = [];
        this.populatePurpose(node);
        _.reverse(this.purpose);
        this.store$.dispatch(new SetPurposeAction(this.purpose));
    }

    public populatePurpose(node) {
        if (node) {
            if (node.issueType !== CustomNodeTypes.EpicChildren && node.issueType !== CustomNodeTypes.RelatedLink) {
                this.purpose.push({
                    key: node.key, issueType: node.issueType, title: node.title, purpose: node.description,
                    editable: node.editable, hfKey: node.hfKey
                });
            }
            if (node.parent) {
                this.populatePurpose(node.parent);
            }
        }
    }
}
