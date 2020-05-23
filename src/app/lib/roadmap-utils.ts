import * as _ from 'lodash';

function add_weeks(dt, n) {
    return new Date(dt.setDate(dt.getDate() + (n * 7)));
}

export function initRoadmapMetadata() {
    return {
        fixedColumns: [{ title: 'name' }],
        timespan: _.map(_.range(24), (idx) => {
            const date = new Date();
            date.setMonth(date.getMonth() + idx);
            const year = date.getFullYear(), month = date.getMonth();
            const title = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            return { idx, title, firstDate: new Date(year, month, 1), lastDate: new Date(year, month + 1, 0) }
        })
    }
}

