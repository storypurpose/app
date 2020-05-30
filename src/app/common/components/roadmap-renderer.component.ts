import { Component, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { isCustomNode } from 'src/app/lib/jira-tree-utils';

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

    getTimelineTypeClass(rowData, idx) {
        const timespan = rowData.timespan;
        if (timespan && timespan[idx] && timespan[idx].isInTimespan) {
            if (!rowData.missingDuedate && !rowData.duedatePassed) {
                return 'bg-primary';
            } else if (rowData.missingDuedate && !rowData.duedatePassed) {
                return 'bg-timeline';
            } else if (rowData.duedatePassed) {
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

    hasMiscInfo(rowData) {
        return !isCustomNode(rowData) && (rowData.missingDuedate || rowData.duedatePassed);
    }
    getMiscInfo(rowData) {
        return `${(rowData.missingDuedate ? 'Duedate is missing' : '')} ${(rowData.duedatePassed ? 'Duedate elapsed' : '')}`
    }

    isCustomTypeNode = rowData => isCustomNode(rowData);
}
