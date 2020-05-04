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
import { NgbDropdownModule, NgbCollapseModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkbenchComponent } from './components/workbench.component';
import { AngularSplitModule } from 'angular-split';
import { StoryboardComponent } from './components/storyboard.component';
import { DialogModule } from 'primeng/dialog';

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
    SelectedItemContainerComponent, WorkbenchComponent,
    PurposeDetailsComponent, TasklistComponent, ExtendedFieldsComponent, StoryboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxMdModule,
    FontAwesomeModule,

    DialogModule,
    SidebarModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbNavModule,

    AngularSplitModule,

    CommonComponentsModule,
    StoreModule.forFeature("issue", issueReducer, { initialState: issueInitialState }),

    RouterModule.forChild(routes)
  ]
})
export class IssueModule { }
