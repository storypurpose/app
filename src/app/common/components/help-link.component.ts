import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment'
@Component({
    selector: 'app-help-link',
    templateUrl: './help-link.component.html'
})
export class HelpLinkComponent {
    @Input() tag: string;
    public helpurl = environment.helpsite
}
