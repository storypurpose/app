import { Component, Output, EventEmitter } from '@angular/core';
import { JiraService } from '../../lib/jira.service';
import * as _ from 'lodash';
import { flattenNodes } from '../../lib/tree-utils';

@Component({
  selector: 'app-epic-list',
  templateUrl: './epiclist.component.html'
})
export class EpicListComponent {
  @Output() epicSelected = new EventEmitter<any>();

  title = 'text-matrix';
  query = "manual";
  result: any;
  filteredIssues: any;

  constructor(public jiraService: JiraService) {

  }

  filterIssues(query) {
    this.filteredIssues = flattenNodes(this.result.issues);
    if (this.result && this.result.issues && query > '') {
      this.filteredIssues = _.filter(this.filteredIssues,
        (fi) => (fi.key.toUpperCase().includes(query.toUpperCase()) || fi.title.toUpperCase().includes(query.toUpperCase())));
    }
  }

  onEpicSelected = (issue) => this.epicSelected.emit(issue);

}
