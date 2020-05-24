import * as _ from 'lodash';

function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

export function initRoadmapMetadata(startdate, enddate) {
    const noOfMonths = monthDiff(startdate, enddate);
    return {
        fixedColumns: [{ title: 'Issue' }],
        timespan: getMonthwiseRange()
    }

    function getMonthwiseRange() {
        return _.map(_.range(noOfMonths), (idx) => {
            const date = new Date(startdate);
            date.setMonth(date.getMonth() + idx);
            const year = date.getFullYear(), month = date.getMonth();
            const title = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            return { idx, title, firstDate: new Date(year, month, 1), lastDate: new Date(year, month + 1, 0) };
        });
    }
}

