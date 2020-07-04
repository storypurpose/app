import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-grouped-issues',
    templateUrl: './grouped-issues.component.html'
})
export class GroupedIssuesComponent {
    @Input() groupedIssues;
    @Input() projectConfig;
    @Output() fieldUpdated = new EventEmitter<any>();
    
    linkIssueVisible = false;
    selectedIssue: any;
    resetIssue = () => this.selectedIssue = null;
    selectIssue(ri) {
        this.selectedIssue = ri;
        this.selectedIssue.projectConfig = this.projectConfig;
    }

    onFieldUpdated = (eventArgs) => this.fieldUpdated.emit(eventArgs);
}
