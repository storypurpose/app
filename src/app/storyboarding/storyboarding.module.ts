import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { storyboardingInitialState } from './+state/storyboarding.init';
import { storyboardingReducer } from './+state/storyboarding.reducer';
import { NgxMdModule } from 'ngx-md';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Route } from '@angular/router';
import { CommonComponentsModule } from '../common/common-components.module';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { StoryboardComponent } from './components/details.component';
import { StoryboardingContainerComponent } from './components/container.component';
import { TreeTableModule } from 'primeng/treetable';

import { StoryListComponent } from './components/story-list.component';
import { DialogModule } from 'primeng/dialog';
import { StoryboardForFilterComponent } from './components/for-filter.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Route[] = [
  { path: 'forfilter', component: StoryboardForFilterComponent },
  {
    path: ':selected', component: StoryboardingContainerComponent, children: [
      { path: 'list', component: StoryListComponent },
      { path: 'details', component: StoryboardComponent },
      { path: '', redirectTo: "details", pathMatch: "full" }
    ]
  }
];

@NgModule({
  declarations: [
    StoryboardingContainerComponent, StoryboardComponent, StoryListComponent,
    StoryboardForFilterComponent
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
    NgbModule,
    
    CommonComponentsModule,

    StoreModule.forFeature("storyboarding", storyboardingReducer, { initialState: storyboardingInitialState }),

    RouterModule.forChild(routes)
  ]
})
export class StoryboardingModule { }
