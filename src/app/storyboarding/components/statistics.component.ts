import { Component, Input } from '@angular/core';
import * as _ from 'lodash';
import { ChartOptions } from 'chart.js';

@Component({
    selector: 'app-epic-statistics',
    templateUrl: './statistics.component.html'
})
export class StatisticsComponent {
    @Input() set statusStats(value: any) {
        this.initStatusCharts(value);
    }
    @Input() set issueTypeStats(value: any) {
        this.initIssueTypeCharts(value);
    }
    @Input() set componentStats(value: any) {
        this.initComponentCharts(value);
    }

    public componentChartLabels: any;
    public componentChartData: any;
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

    initComponentCharts(stats) {
        this.componentChartLabels = _.map(stats, s => `${s.key} / ${s.count}`);
        this.componentChartData = _.map(stats, 'count');
    }
    initStatusCharts(stats) {
        this.statusChartLabels = _.map(stats, s => `${s.key} / ${s.count}`);
        this.statusChartData = _.map(stats, 'count');
    }
    initIssueTypeCharts(stats) {
        this.issueTypeChartLabels = _.map(stats, s => `${s.key} / ${s.count}`);
        this.issueTypeChartData = _.map(stats, 'count');
    }
}
