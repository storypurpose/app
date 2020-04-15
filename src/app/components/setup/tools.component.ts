import { Component, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { ShowConnectionEditorAction } from '../../+state/app.actions';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+state/app.state';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html'
})
export class ToolsComponent {

    constructor(public store$: Store<AppState>) {
    }

    openConnectionDetailEditor() {
        this.store$.dispatch(new ShowConnectionEditorAction(true));
    }
}