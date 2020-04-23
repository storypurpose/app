import { Component, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-extended-fields',
    templateUrl: './extended-fields.component.html'
})
export class ExtendedFieldsComponent {
    @Input() issue: any;
    public fontSizeSmall = false;

    // issue$: Subscription;

    // constructor(public store$: Store<AppState>) {
    // }
    // ngOnInit(): void {
    //     this.issue$ = this.store$.select(p => p.purpose.selectedItem).pipe(filter(p => p))
    //         .subscribe(p => this.issue = p);
    // }
    // ngOnDestroy(): void {
    //     this.issue$ ? this.issue$.unsubscribe() : null;
    // }
}
