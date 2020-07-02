import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutofocusDirective } from './autofocus.directive';

const types = [AutofocusDirective]

@NgModule({
  declarations: types,
  exports: types,
  imports: [
    CommonModule
  ]
})
export class SharedLibModule { }
