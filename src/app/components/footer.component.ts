import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html'
})
export class FooterComponent {
    @Input() connectionDetails: any;

    @Output() modeChange = new EventEmitter<any>();
    onModeChange(args) {
        this.modeChange.emit(args);
    }
}
