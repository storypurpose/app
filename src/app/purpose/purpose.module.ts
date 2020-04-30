import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { purposeInitialState } from './+state/purpose.init';
import { purposeReducer } from './+state/purpose.reducer';
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

const routes: Route[] = [
  {
    path: ':selected', component: SelectedItemContainerComponent, children: [
      { path: 'workbench', component: WorkbenchComponent },
      { path: 'items', component: TasklistComponent },
      { path: 'attributes', component: ExtendedFieldsComponent },
      { path: 'details', component: PurposeDetailsComponent },
      { path: '', redirectTo: "details", pathMatch: "full" }
    ]
  }
];

@NgModule({
  declarations: [
    SelectedItemContainerComponent, WorkbenchComponent,
    PurposeDetailsComponent, TasklistComponent, ExtendedFieldsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxMdModule,
    FontAwesomeModule,

    SidebarModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbNavModule,
    
    AngularSplitModule,

    CommonComponentsModule,
    StoreModule.forFeature("purpose", purposeReducer, { initialState: purposeInitialState }),

    RouterModule.forChild(routes)
  ]
})
export class PurposeModule { }
