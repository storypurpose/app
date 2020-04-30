import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { NgxMdModule } from 'ngx-md';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Route } from '@angular/router';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { TreeTableModule } from 'primeng/treetable';

import { ChartsModule } from 'ng2-charts';
import 'chartjs-plugin-labels';
import { DialogModule } from 'primeng/dialog';
import { searchInitialState } from './+state/search.init';
import { searchReducer } from './+state/search.reducer';
import { QueryExecutorComponent } from './components/query-executor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Route[] = [
  // { path: 'search', component: StoryboardForFilterComponent },
  // {
  //   path: ':selected', component: StoryboardingContainerComponent, children: [
  //     { path: 'list', component: StoryListComponent },
  //     { path: 'details', component: StoryboardComponent },
  //     { path: '', redirectTo: "details", pathMatch: "full" }
  //   ]
  // }
];

@NgModule({
  declarations: [
    QueryExecutorComponent
    // StoryboardingContainerComponent, StoryboardComponent, StoryListComponent, StatisticsComponent,
    // StoryboardForFilterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxMdModule,
    FontAwesomeModule,

    SidebarModule,
    TreeTableModule,
    DialogModule,
    ChartsModule,

    NgbModule,

    StoreModule.forFeature("search", searchReducer, { initialState: searchInitialState }),

    RouterModule.forChild(routes)
  ],
  exports: [
    QueryExecutorComponent
  ]
})
export class SearchModule { }
