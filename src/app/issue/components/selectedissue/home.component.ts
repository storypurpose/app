import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-selected-issue-home',
    templateUrl: './home.component.html'
})
export class SelectedIssueHomeComponent implements OnInit {

    constructor(private router: Router, private activatedRoute: ActivatedRoute) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.autoRedirect();
            }
        })
    }

    ngOnInit(): void {
        this.autoRedirect();
    }

    private autoRedirect() {
        if (this.activatedRoute.children.length === 0) {
            const issue = this.activatedRoute.parent.snapshot.params.issue;
            this.router.navigate([issue], { relativeTo: this.activatedRoute });
        }
    }
}
