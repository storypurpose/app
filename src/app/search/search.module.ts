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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchResultContainerComponent } from './components/result-container.component';
import { SearchListViewComponent } from './components/list-view.component';
import { SearchStoryboardViewComponent } from './components/storyboard-view.component';
import { AngularSplitModule } from 'angular-split';
import { SavedSearchesComponent } from './components/saved-searches.component';
import { FavouriteSearchesComponent } from './components/favourite-searches.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { EffectsModule } from '@ngrx/effects';
import { SearchEffects } from './+state/search.effects';
import { SearchRoadmapViewComponent } from './components/roadmap-view.component';

const routes: Route[] = [
  {
    path: '', component: SearchResultContainerComponent, children: [
      { path: 'list', component: SearchListViewComponent },
      { path: 'storyboard', component: SearchStoryboardViewComponent },
      { path: 'roadmap', component: SearchRoadmapViewComponent }
    ]
  },
];

@NgModule({
  declarations: [
    SearchResultContainerComponent, SearchListViewComponent, SearchStoryboardViewComponent, SearchRoadmapViewComponent,
    SavedSearchesComponent, FavouriteSearchesComponent
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
    MultiSelectModule,

    AngularSplitModule,

    NgbModule,
    CommonComponentsModule,

    StoreModule.forFeature("search", searchReducer, { initialState: searchInitialState }),
    EffectsModule.forFeature([SearchEffects]),

    RouterModule.forChild(routes)
  ]
})
export class SearchModule { }
