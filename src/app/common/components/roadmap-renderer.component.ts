import { Component, Input } from '@angular/core';
import { initRoadmapMetadata } from 'src/app/lib/roadmap-utils';
import * as _ from 'lodash';
import { CustomNodeTypes } from 'src/app/lib/jira-tree-utils';

@Component({
    selector: 'app-roadmap-renderer',
    templateUrl: './roadmap-renderer.component.html'
})

export class RoadmapRendererComponent {
    @Input() contentHeight: number;

    private _records: any;
    @Input() set records(value: any) {
        this._records = value;
        if (value) {
            this.plotIssuesOnRoadmap();
        }
    }
    get records() {
        return this._records;
    }

    public metadata: any;
    public roadmapItems: any;

    plotIssuesOnRoadmap() {
        this.populateMetadata();
        this.roadmapItems = this.transformToTreeChildren(this.records, this.metadata.timespan)
    }

    private populateMetadata() {
        const withDates = _.map(this.records, (record) => {
            if (!record.created) {
                const minCreated: any = _.minBy(_.union(record.children || []), 'created');
                if (minCreated) {
                    record.created = minCreated.created;
                }
            }
            if (!record.created) {
                const maxDuedate: any = _.maxBy(_.union(record.children || []), 'duedate');
                if (maxDuedate) {
                    record.duedate = maxDuedate.duedate;
                }
            }
            return record;
        });
        const minStartDateRecord: any = _.minBy(_.union(withDates || []), 'created');
        const minStartDate = minStartDateRecord && minStartDateRecord.created ? new Date(minStartDateRecord.created) : new Date();
        const maxDueDateRecord: any = _.maxBy(_.union(withDates || []), 'duedate');
        const maxDueDate = maxDueDateRecord && maxDueDateRecord.duedate ? new Date(maxDueDateRecord.duedate) : new Date();
        this.metadata = initRoadmapMetadata(minStartDate, maxDueDate);
    }

    private transformToTreeChildren(children, timespanLookup) {
        if (!children) {
            return [];
        }
        children = _.orderBy(children, 'created');
        return _.map(children, (ec) => {
            const record: any = _.pick(ec, ['label', 'title', 'icon', 'key', 'issueType', 'status', 'timespan', 'created', 'duedate', 'resolution']);
            record.label = record.title;
            record.title = this.prepareTitle(record);
            const created = ec.created ? new Date(ec.created) : new Date();
            let duedate = created;
            let missingDuedate = true;
            let duedatePassed = false;
            if (ec.duedate) {
                duedate = new Date(ec.duedate);
                missingDuedate = false;
                duedatePassed = !ec.resolution && duedate <= new Date();
            }
            record.timespan = _.map(timespanLookup, (ts) => {
                return {
                    idx: ts.idx,
                    missingDuedate,
                    duedatePassed,
                    isInTimespan:
                        created <= ts.lastDate &&
                        ((duedate >= ts.firstDate && duedate <= ts.lastDate) || duedate > ts.lastDate)
                };
            });
            const result: any = { data: record };
            if (ec.children && ec.children.length > 0) {
                result.children = this.transformToTreeChildren(ec.children, timespanLookup);
                result.expanded = true;
                result.leaf = false;
            }
            if (ec.issueType === CustomNodeTypes.Epic) {
                result.leaf = false;
            }
            return result;
        });
    }

    private prepareTitle(node: any) {
        const created = node.created ? this.toShortDate(new Date(node.created)) + ' -> ' : 'Missing created date'
        const duedate = node.updated ? this.toShortDate(new Date(node.duedate)) : ' Missing duedate'
        const key = node.key ? node.key + ": " : '';
        const status = node.status ? `[${node.status}]` : '';
        const resolution = node.resolution ? `[${node.resolution}]` : 'UNRESOLVED';
        return `${key} ${node.title} ${status} ${created} ${duedate} ${resolution}`;
    }

    toShortDate(date) {
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    }

    getTimelineTypeClass(timespan, idx) {
        if (timespan && timespan[idx].isInTimespan) {
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

}
