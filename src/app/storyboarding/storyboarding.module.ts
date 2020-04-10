import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { storyboardingInitialState } from './+state/storyboarding.init';
import { storyboardingReducer } from './+state/storyboarding.reducer';
import { NgxMdModule } from 'ngx-md';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Route } from '@angular/router';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { StoryboardComponent } from './components/details.component';
import { StoryboardingContainerComponent } from './components/container.component';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';

import { ChartsModule } from 'ng2-charts';
import 'chartjs-plugin-labels';

const routes: Route[] = [
  {
    path: '', component: StoryboardingContainerComponent, children: [
      { path: 'details', component: StoryboardComponent },
      { path: '', redirectTo: 'details', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    StoryboardingContainerComponent, StoryboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxMdModule,
    FontAwesomeModule,

    SidebarModule,
    TreeTableModule,

    ChartsModule,

    CommonComponentsModule,

    StoreModule.forFeature("storyboarding", storyboardingReducer, { initialState: storyboardingInitialState }),
    RouterModule.forChild(routes)
  ]
})
export class StoryboardingModule { }
