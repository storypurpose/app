import { Component } from '@angular/core';
import { environment } from "../../../environments/environment";

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.component.html'
})
export class PrivacyComponent {

    proxyurl = environment.proxyurl;

}
