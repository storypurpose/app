import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { purposeInitialState } from './+state/purpose.init';
import { purposeReducer } from './+state/purpose.reducer';
import { PurposeDetailsComponent } from './components/details.component';
import { NgxMdModule } from 'ngx-md';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RecentlyViewedComponent } from '../components/recently-viewed.component';
import { RouterModule } from '@angular/router';
import { HierarchyFieldEditorComponent } from './components/hierarchy-field.component';
import { OrganizationComponent } from './components/organization.component';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { SubItemsComponent } from './components/sub-items.component';
import { ExtendedFieldsComponent } from './components/extended-fields.component';
import { IssueviewerComponent } from '../components/issueviewer.component';
import { SelectedItemComponent } from './components/selected-item.component';



@NgModule({
  declarations: [
    SelectedItemComponent,
    PurposeDetailsComponent, SubItemsComponent, ExtendedFieldsComponent,
    OrganizationComponent, HierarchyFieldEditorComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxMdModule,
    FontAwesomeModule,

    SidebarModule,

    CommonComponentsModule,

    StoreModule.forFeature("purpose", purposeReducer, { initialState: purposeInitialState })
  ]
})
export class PurposeModule { }
