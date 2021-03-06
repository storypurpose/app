import { Component, Input } from '@angular/core';
import * as _ from 'lodash';
import { ChartOptions } from 'chart.js';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html'
})
export class StatisticsComponent {
    @Input() groupByColumn: string;

    private _statistics: any;
    @Input() set statistics(value: any) {
        this._statistics = value;
        if (value) {
            this.initExtendedStats(value.extended);
            this.initStatusCharts(value.status);
            this.initIssueTypeCharts(value.issueTypes);
            this.initGenericCharts(value[this.groupByColumn]);
        }
    }
    get statistics() {
        return this._statistics;
    }

    public extendedStats: any;
    public genericChartLabels: any;
    public genericChartData: any;
    public statusChartLabels: any;
    public statusChartData: any;
    public issueTypeChartLabels: any;
    public issueTypeChartData: any;
    public chartOptions: ChartOptions = {
        responsive: true,
        tooltips: { enabled: false },
        legend: { position: 'right' },
        plugins: {
            labels: [
                {
                    render: 'value',
                    fontColor: '#000'
                }]
        }
    };

    initGenericCharts(stats) {
        this.genericChartLabels = _.map(stats, s => `${s.key} / ${s.count}`);
        this.genericChartData = _.map(stats, 'count');
    }
    initStatusCharts(stats) {
        this.statusChartLabels = _.map(stats, s => `${s.key} / ${s.count}`);
        this.statusChartData = _.map(stats, 'count');
    }
    initIssueTypeCharts(stats) {
        this.issueTypeChartLabels = _.map(stats, s => `${s.key} / ${s.count}`);
        this.issueTypeChartData = _.map(stats, 'count');
    }
    initExtendedStats(extended) {
        this.extendedStats = (extended) ? _.filter(extended, ex => ex.value > 0) : [];
    }
}
