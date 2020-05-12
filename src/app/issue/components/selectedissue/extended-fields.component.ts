import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-extended-fields',
    templateUrl: './extended-fields.component.html'
})
export class ExtendedFieldsComponent {
    @Input() issue: any;
    public fontSizeSmall = false;
}
