import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonPanelComponent } from './components/button-panel.component';
import { StoryboardRendererComponent } from './components/storyboard-renderer.component';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { StatisticsComponent } from './components/statistics.component';
import { ChartsModule } from 'ng2-charts';
import 'chartjs-plugin-labels';
import { AutofocusDirective } from './lib/autofocus.directive';
import { NgbDropdownModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { MultilistSelectorComponent } from './components/multilist-selector.component';
import { IssueNavigationMenuComponent } from './components/issue-navigation-menu.component';
import { SliderModule } from 'primeng/slider';
import { TimelineRendererComponent } from './components/timeline-renderer.component';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { HelpLinkComponent } from './components/help-link.component';
import { CommentlistComponent } from './components/comment-list.component';
import { NgxMdModule } from 'ngx-md';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { commonInitialState } from './+state/common.init';
import { commonReducer } from './+state/common.reducer';
import { CommonEffects } from './+state/common.effects';
import { IssueDetailsComponent } from './components/issue-details.component';
import { TasklistComponent } from './components/task-list.component';
import { SidebarModule } from 'primeng/sidebar';

const components = [
  ButtonPanelComponent, StoryboardRendererComponent, StatisticsComponent, AutofocusDirective,
  MultilistSelectorComponent, IssueNavigationMenuComponent, TimelineRendererComponent, HelpLinkComponent,
  TasklistComponent,
  CommentlistComponent, IssueDetailsComponent
];
@NgModule({
  exports: components,
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ChartsModule,

    NgxMdModule,

    DialogModule,
    TreeTableModule,
    SliderModule,
    SidebarModule,

    NgbCollapseModule,
    NgbDropdownModule,

    FontAwesomeModule,

    StoreModule.forFeature("common", commonReducer, { initialState: commonInitialState }),
    EffectsModule.forFeature([CommonEffects]),
  ],
})
export class CommonComponentsModule { }
