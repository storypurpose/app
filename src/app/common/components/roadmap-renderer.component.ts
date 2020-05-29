import { Component, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { JiraService } from 'src/app/lib/jira.service';

@Component({
    selector: 'app-roadmap-renderer',
    templateUrl: './roadmap-renderer.component.html'
})

export class RoadmapRendererComponent {
    @Output() nodeExpand = new EventEmitter<any>();
    @Input() contentHeight: number;

    private _roadmap: any;
    @Input() set roadmap(value: any) {
        this._roadmap = value;
        if (value) {
            this.metadata = value.metadata;
            this.roadmapItems = value.records;
        }
    }
    get roadmap() {
        return this._roadmap;
    }
    public metadata: any;
    public roadmapItems: any;

    constructor(public jiraService: JiraService) {

    }

    getTimelineTypeClass(timespan, idx) {
        if (timespan && timespan[idx] && timespan[idx].isInTimespan) {
            const col = timespan[idx];
            if (!col.missingDuedate && !col.duedatePassed) {
                return 'bg-primary';
            } else if (col.missingDuedate && !col.duedatePassed) {
                return 'bg-timeline';
            } else if (col.duedatePassed) {
                return 'bg-warning';
            }
        }
        return '';
    }

    onNodeExpand(args) {
        if (args.node && args.node.data && args.node.data.key && !args.node.children) {
            this.nodeExpand.emit(args.node.data.key);
        }
    }
}
