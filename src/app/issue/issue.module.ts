import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { issueInitialState } from './+state/issue.init';
import { issueReducer } from './+state/issue.reducer';
import { PurposeDetailsComponent } from './components/selectedissue/purpose.component';
import { NgxMdModule } from 'ngx-md';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Route } from '@angular/router';
import { AppCommonModule } from '../common/app-common.module';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { SelectedIssueContainerComponent } from './components/selectedissue/selected-issue-container.component';
import { NgbDropdownModule, NgbCollapseModule, NgbNavModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkbenchComponent } from './components/selectedissue/workbench.component';
import { AngularSplitModule } from 'angular-split';
import { StoryboardComponent } from './components/selectedissue/storyboard.component';
import { DialogModule } from 'primeng/dialog';
import { RecentlyViewedComponent } from './components/recently-viewed.component';
import { EffectsModule } from '@ngrx/effects';
import { IssueEffects } from './+state/issue.effects';
import { IssueContainerComponent } from './components/primary-issue-container.component';
import { TreeModule } from 'primeng/tree';
import { ContextMenuModule } from 'primeng/contextmenu';
import { IssueHomeComponent } from './components/home.component';
import { IssueEntryComponent } from './components/issue-entry.component';
import { IssueNotEnteredComponent } from './components/issue-not-entered.component';
import { SelectedIssueHomeComponent } from './components/selectedissue/home.component';
import { GroupedIssuelistComponent } from './components/selectedissue/grouped-issue-list.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { TimelineComponent } from './components/selectedissue/timeline.component';
import { TreeTableModule } from 'primeng/treetable';
import { IssueTreeviewComponent } from './components/issue-treeview.component';

const routes: Route[] = [
  {
    path: '', component: IssueHomeComponent, children: [
      {
        path: ':issue', component: IssueContainerComponent, children: [
          {
            path: 'purpose', component: SelectedIssueHomeComponent, children: [
              {
                path: ':selected', component: SelectedIssueContainerComponent, children: [
                  { path: 'details', component: PurposeDetailsComponent },
                  { path: 'workbench', component: WorkbenchComponent },
                  { path: 'storyboard', component: StoryboardComponent },
                  { path: 'timeline', component: TimelineComponent },
                  { path: '', redirectTo: "details", pathMatch: "full" }
                ]
              }
            ]
          },
          { path: '', redirectTo: 'purpose', pathMatch: 'full' }
        ]
      },
      { path: '', component: IssueNotEnteredComponent }
    ]
  },
];

@NgModule({
  declarations: [
    IssueHomeComponent, IssueContainerComponent, IssueTreeviewComponent, IssueNotEnteredComponent, IssueEntryComponent,
    SelectedIssueHomeComponent,
    SelectedIssueContainerComponent, WorkbenchComponent, RecentlyViewedComponent,
    PurposeDetailsComponent, StoryboardComponent, TimelineComponent,
    GroupedIssuelistComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxMdModule,

    TreeModule,
    TreeTableModule,
    ContextMenuModule,
    DialogModule,
    SidebarModule,
    MultiSelectModule,

    NgbDropdownModule,
    NgbCollapseModule,
    NgbNavModule,
    NgbTypeaheadModule,

    FontAwesomeModule,

    AngularSplitModule,

    AppCommonModule,
    StoreModule.forFeature("issue", issueReducer, { initialState: issueInitialState }),
    EffectsModule.forFeature([IssueEffects]),

    RouterModule.forChild(routes)
  ]
})
export class IssueModule { }
