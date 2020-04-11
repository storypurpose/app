import { Component } from '@angular/core';
import { environment } from "../../../environments/environment";

@Component({
    selector: 'app-terms',
    templateUrl: './terms.component.html'
})
export class TermsComponent {

    proxyurl = environment.proxyurl;

}
