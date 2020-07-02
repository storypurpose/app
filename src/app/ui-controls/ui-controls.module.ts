import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxMdModule } from 'ngx-md';
import { TextboxComponent } from './components/textbox.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedLibModule } from '../shared-lib/shared-lib.module';
import { TextareaComponent } from './components/textarea.component';

const components = [TextboxComponent, TextareaComponent];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    CommonModule,
    FormsModule,

    SharedLibModule,

    NgxMdModule,
    FontAwesomeModule
  ]
})
export class UIControlsModule { }
