import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { issueInitialState } from './+state/issue.init';
import { issueReducer } from './+state/issue.reducer';
import { PurposeDetailsComponent } from './components/purpose.component';
import { NgxMdModule } from 'ngx-md';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Route } from '@angular/router';
import { CommonComponentsModule } from '../common/common-components.module';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { TasklistComponent } from './components/task-list.component';
import { ExtendedFieldsComponent } from './components/extended-fields.component';
import { SelectedItemContainerComponent } from './components/container.component';
import { NgbDropdownModule, NgbCollapseModule, NgbNavModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkbenchComponent } from './components/workbench.component';
import { AngularSplitModule } from 'angular-split';
import { StoryboardComponent } from './components/storyboard.component';
import { DialogModule } from 'primeng/dialog';
import { RecentlyViewedComponent } from './components/recently-viewed.component';
import { EffectsModule } from '@ngrx/effects';
import { IssueEffects } from './+state/issue.effects';
import { IssueContainerComponent } from './components/issue-container.component';
import { TreeModule } from 'primeng/tree';
import { ContextMenuModule } from 'primeng/contextmenu';
import { IssueHomeComponent } from './components/home.component';
import { IssueEntryComponent } from './components/issue-entry.component';
import { IssueNotEnteredComponent } from './components/issue-not-entered.component';

// const routes: Route[] = [
//   {
//     path: '', component: IssueHomeComponent, children: [
//       {
//         path: ':issue', component: IssueContainerComponent, children: [
//           {
//             path: 'purpose/:selected', component: SelectedItemContainerComponent, children: [
//               { path: 'details', component: PurposeDetailsComponent },
//               { path: 'workbench', component: WorkbenchComponent },
//               { path: 'storyboard', component: StoryboardComponent },
//               { path: '', redirectTo: "details", pathMatch: "full" }
//             ]
//           }
//         ]
//       },
//       { path: '', component: IssueNotEnteredComponent }
//     ]
//   },
// ];


const routes: Route[] = [
  {
    path: ':selected', component: SelectedItemContainerComponent, children: [
      { path: 'details', component: PurposeDetailsComponent },
      { path: 'workbench', component: WorkbenchComponent },
      { path: 'storyboard', component: StoryboardComponent },
      // { path: 'items', component: TasklistComponent },
      // { path: 'attributes', component: ExtendedFieldsComponent },
      { path: '', redirectTo: "details", pathMatch: "full" }
    ]
  }
];

@NgModule({
  declarations: [
    IssueHomeComponent, IssueContainerComponent, IssueNotEnteredComponent, IssueEntryComponent,

    SelectedItemContainerComponent, WorkbenchComponent, RecentlyViewedComponent,
    PurposeDetailsComponent, TasklistComponent, ExtendedFieldsComponent, StoryboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxMdModule,

    TreeModule,
    ContextMenuModule,
    DialogModule,
    SidebarModule,

    NgbDropdownModule,
    NgbCollapseModule,
    NgbNavModule,
    NgbTypeaheadModule,

    FontAwesomeModule,

    AngularSplitModule,

    CommonComponentsModule,
    StoreModule.forFeature("issue", issueReducer, { initialState: issueInitialState }),
    EffectsModule.forFeature([IssueEffects]),

    RouterModule.forChild(routes)
  ]
})
export class IssueModule { }
