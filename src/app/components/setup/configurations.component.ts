import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from '../../+state/app.state';
import { ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-configurations',
    templateUrl: './configurations.component.html'
})
export class ConfigurationsComponent {
    queryparams$: Subscription;
    mode = "both";

    constructor(public activatedRoute: ActivatedRoute, public store$: Store<AppState>) {
    }

    ngOnInit(): void {
        this.queryparams$ = this.activatedRoute.queryParams
            .pipe(filter(p => p && p["mode"] && p["mode"].length > 0), map(p => p["mode"].toLowerCase()))
            .subscribe(p => this.mode = p);
    }
    ngOnDestroy(): void {
        this.queryparams$ ? this.queryparams$.unsubscribe() : null;
    }
}
