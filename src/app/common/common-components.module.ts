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

@NgModule({
  exports: [ButtonPanelComponent, StoryboardRendererComponent, StatisticsComponent],
  declarations: [ButtonPanelComponent, StoryboardRendererComponent, StatisticsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ChartsModule,

    FontAwesomeModule
  ]
})
export class CommonComponentsModule { }
