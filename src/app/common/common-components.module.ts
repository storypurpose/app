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
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MultilistSelectorComponent } from './components/multilist-selector.component';
import { IssueNavigationMenuComponent } from './components/issue-navigation-menu.component';
import { SliderModule } from 'primeng/slider';
import { RoadmapRendererComponent } from './components/roadmap-renderer.component';
import { TreeTableModule } from 'primeng/treetable';

const components = [
  ButtonPanelComponent, StoryboardRendererComponent, StatisticsComponent, AutofocusDirective,
  MultilistSelectorComponent, IssueNavigationMenuComponent, RoadmapRendererComponent
];
@NgModule({
  exports: components,
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ChartsModule,

    TreeTableModule,
    SliderModule,

    NgbDropdownModule,
    FontAwesomeModule
  ],
})
export class CommonComponentsModule { }
