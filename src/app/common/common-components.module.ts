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
import { TimelineRendererComponent } from './components/timeline-renderer.component';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { HelpLinkComponent } from './components/help-link.component';

const components = [
  ButtonPanelComponent, StoryboardRendererComponent, StatisticsComponent, AutofocusDirective,
  MultilistSelectorComponent, IssueNavigationMenuComponent, TimelineRendererComponent, HelpLinkComponent
];
@NgModule({
  exports: components,
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ChartsModule,

    DialogModule,
    TreeTableModule,
    SliderModule,

    NgbDropdownModule,
    FontAwesomeModule
  ],
})
export class CommonComponentsModule { }
