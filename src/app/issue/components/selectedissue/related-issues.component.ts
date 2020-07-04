import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-related-issues',
    templateUrl: './related-issues.component.html'
})
export class RelatedIssuesComponent {
    @Input() groupedRelatedLinks;
    @Input() projectConfig;
    @Output() fieldUpdated = new EventEmitter<any>();
    selectedRelatedIssue: any;

    resetSelectedRelatedIssue = () => this.selectedRelatedIssue = null;
    selectRelatedIssue(ri) {
        this.selectedRelatedIssue = ri;
        this.selectedRelatedIssue.projectConfig = this.projectConfig;
    }

    onFieldUpdated = (eventArgs) => this.fieldUpdated.emit(eventArgs);
}