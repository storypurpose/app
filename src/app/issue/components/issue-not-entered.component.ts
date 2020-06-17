import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-issue-not-entered',
    templateUrl: './issue-not-entered.component.html'
})
export class IssueNotEnteredComponent {
    selectedTab = 1;
    showSingleIssueHelp = false;
    showJQLHelp = false;
    showStoryPurposeHelp = false;

    key = "";
    query = "";

    constructor(public router: Router) { }

    navigateToKey = (key) => this.router.navigate(['/browse', key.trim()]);
    canNavigateToKey = () => this.key && this.key.trim().length > 0;

    navigateJql = (query) => this.router.navigate(['/search/list'], { queryParams: { query } });
    canNavigateJql = () => this.query && this.query.trim().length > 0;
}