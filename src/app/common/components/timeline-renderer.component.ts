import { Component, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { isCustomNode } from 'src/app/lib/jira-tree-utils';
import * as utils from '../../lib/utils';

@Component({
    selector: 'app-timeline-renderer',
    templateUrl: './timeline-renderer.component.html'
})

export class TimelineRendererComponent {
    @Output() nodeExpand = new EventEmitter<any>();
    @Input() contentHeight: number;

    private _timeline: any;
    @Input() set timeline(value: any) {
        this._timeline = value;
        if (value) {
            this.metadata = value.metadata;
            this.timelineItems = value.records;
        }
    }
    get timeline() {
        return this._timeline;
    }
    public metadata: any;
    public timelineItems: any;

    showStatistics = false;
    groupByColumn = "components";
    statistics: any;

    onShowStatistics(statistics) {
        this.statistics = statistics;
        this.showStatistics = true;
    }
    getTimelineTypeClass(rowData, idx) {
        const timespan = rowData.timespan;
        if (timespan && timespan[idx] && timespan[idx].isInTimespan) {
            if (rowData.resolution) {
                return 'bg-success';
            } else if (!rowData.missingDuedate && !rowData.duedatePassed) {
                return 'bg-primary';
            } else if (rowData.duedatePassed) {
                return 'bg-warning';
            } else {
                return 'bg-timeline';
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
        return !rowData.statistics && !isCustomNode(rowData) && !rowData.resolution && (rowData.missingStartdate || rowData.missingDuedate || rowData.duedatePassed);
    }
    getMiscInfo(rowData) {
        return `${(rowData.missingStartdate ? 'No startdate.' : '')} ${(rowData.missingDuedate ? 'No duedate.' : '')} ${(rowData.duedatePassed ? `Duedate ${utils.toShortDate(new Date(rowData.duedate))} elapsed` : '')}`
    }

    isCustomTypeNode = rowData => isCustomNode(rowData);
}
