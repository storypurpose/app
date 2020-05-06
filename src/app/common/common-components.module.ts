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
import { FixVersionsEditorComponent } from './components/fixversions-editor.component';
import { FieldSelectorListComponent } from './components/field-selector-list.component';

const components = [
  ButtonPanelComponent, StoryboardRendererComponent, StatisticsComponent, AutofocusDirective, FixVersionsEditorComponent,
  FieldSelectorListComponent
];
@NgModule({
  exports: components,
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ChartsModule,

    NgbDropdownModule,
    FontAwesomeModule
  ],
})
export class CommonComponentsModule { }
