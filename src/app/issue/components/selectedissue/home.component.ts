import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-selected-issue-home',
    templateUrl: './home.component.html'
})
export class SelectedIssueHomeComponent implements OnInit {

    constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        var activeChildren = this.activatedRoute.children.length;
        if (activeChildren === 0) {
            console.log('redirecting', activeChildren);
            const issue = this.activatedRoute.parent.snapshot.params.issue;
            this.router.navigate([issue], { relativeTo: this.activatedRoute });
        }
    }
}
