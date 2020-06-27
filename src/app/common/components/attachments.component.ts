import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-attachments',
    templateUrl: './attachments.component.html'
})
export class AttachmentsComponent {
    @Input() issue: any;
}
