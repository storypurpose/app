import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-issue-metafields',
    templateUrl: './issue-metafields.component.html'
})
export class IssueMetafieldsComponent {
    @Input() issue: any;

    fixversionsVisible = false;
    componentsVisible = false;
    labelsVisible = false;

}