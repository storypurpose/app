import { Component } from '@angular/core';
import { environment } from "../../../environments/environment"
@Component({
    selector: 'app-copyright',
    templateUrl: './copyright.component.html'
})
export class CopyrightComponent {
    public version = environment.VERSION;
}
