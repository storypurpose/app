import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { purposeInitialState } from './+state/purpose.init';
import { purposeReducer } from './+state/purpose.reducer';
import { PurposeDetailsComponent } from './components/purpose.component';
import { NgxMdModule } from 'ngx-md';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Route } from '@angular/router';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { SubItemsComponent } from './components/sub-items.component';
import { ExtendedFieldsComponent } from './components/extended-fields.component';
import { SelectedItemContainerComponent } from './components/container.component';

const routes: Route[] = [
  {
    path: ':selected', component: SelectedItemContainerComponent, children: [
      { path: 'items', component: SubItemsComponent },
      { path: 'details', component: ExtendedFieldsComponent },
      { path: 'purpose', component: PurposeDetailsComponent },
      { path: '', redirectTo: "purpose", pathMatch: "full" }
    ]
  }
];

@NgModule({
  declarations: [
    SelectedItemContainerComponent,
    PurposeDetailsComponent, SubItemsComponent, ExtendedFieldsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxMdModule,
    FontAwesomeModule,

    SidebarModule,

    CommonComponentsModule,
    StoreModule.forFeature("purpose", purposeReducer, { initialState: purposeInitialState }),

    RouterModule.forChild(routes)
  ]
})
export class PurposeModule { }
