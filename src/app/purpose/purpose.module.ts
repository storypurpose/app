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



@NgModule({
  declarations: [PurposeDetailsComponent],
  imports: [
    CommonModule,
    RouterModule,
    NgxMdModule,
    FontAwesomeModule,

    StoreModule.forFeature("purpose", purposeReducer, { initialState: purposeInitialState })
  ]
})
export class PurposeModule { }
