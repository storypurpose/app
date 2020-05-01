import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { NgxMdModule } from 'ngx-md';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Route } from '@angular/router';
import { CommonComponentsModule } from '../common/common-components.module';
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
import { SearchResultContainerComponent } from './components/result-container.component';
import { SearchListViewComponent } from './components/list-view.component';
import { SearchStoryboardViewComponent } from './components/storyboard-view.component';

const routes: Route[] = [
  {
    path: 'search', component: SearchResultContainerComponent, children: [
      { path: 'list', component: SearchListViewComponent },
      { path: 'storyboard', component: SearchStoryboardViewComponent }
    ]
  },
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
    QueryExecutorComponent,
    SearchResultContainerComponent, SearchListViewComponent, SearchStoryboardViewComponent
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
    CommonComponentsModule,

    StoreModule.forFeature("search", searchReducer, { initialState: searchInitialState }),

    RouterModule.forChild(routes)
  ],
  exports: [
    QueryExecutorComponent
  ]
})
export class SearchModule { }
