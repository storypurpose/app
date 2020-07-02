import * as _ from 'lodash';
import { Search } from './search.state';
import { ActionTypes } from './search.actions';
import * as timelineUtil from 'src/app/lib/timeline-utils'
import { populateFieldValuesCompact } from 'src/app/lib/jira-tree-utils';
import { populateStatistics, extractMetadata } from 'src/app/lib/statistics-utils';

export function searchReducer(state: Search, action: any): Search {
    switch (action.type) {
        case ActionTypes.SetQueryContext: {
            return { ...state, queryContext: action.payload };
        }
        case ActionTypes.LoadSearchResults: {
            const queryContext = action.payload;
            return { ...state, issuelist: [], queryContext };
        }
        case ActionTypes.LoadSearchResultsSuccess: {
            return { ...state, issuelist: action.payload };
        }
        // case ActionTypes.UpdateSearchFieldValueSuccess: {
        //     const updatedField = action.payload;
        //     return {
        //         ...state, issuelist: {
        //             ...state.issuelist, results: state.issuelist.results.map(node => {
        //                 return (node.key === updatedField.issueKey)
        //                     ? node[updatedField.fieldname] = updatedField.updatedValue
        //                     : node;
        //             })
        //         }
        //     };
        // }

        case ActionTypes.LoadSavedSearchlist: {
            return { ...state, savedSearchlist: [] };
        }

        case ActionTypes.LoadSavedSearchlistSuccess: {
            const savedSearchlist = _.map(action.payload, item => _.pick(item, ['id', 'name', 'jql']));
            return { ...state, savedSearchlist };
        }

        case ActionTypes.PopulateSearchResultTimelineView: {
            const startdateField = action.payload.startdateField;
            const results = action.payload.results;
            const metadata = timelineUtil.populateMetadata(results, startdateField);
            const records = timelineUtil.transformToTreeChildren(results, metadata.timespan, startdateField, true);
            return { ...state, timelineView: { metadata, records } };
        }

        case ActionTypes.LoadSearchResultTimelineNodeSuccess: {
            const startdateCode = 'created';    // TODO: populate startdatefrom projectconfig
            const issueKey = action.payload.issueKey;
            const issues = action.payload.payload && action.payload.payload.issues
                ? _.map(action.payload.payload.issues, p => populateFieldValuesCompact(p))
                : [];
            const children = timelineUtil.transformToTreeChildren(issues, state.timelineView.metadata.timespan, startdateCode, false);
            const groupByColumn = "components";
            return {
                ...state, timelineView: {
                    ...state.timelineView, records: state.timelineView.records.map(node => {
                        return (node && node.data && node.data.key === issueKey)
                            ? {
                                ...node, children, data: {
                                    ...node.data,
                                    isHeading: children && children.length > 0,
                                    statistics: populateStatistics(extractMetadata(issues, groupByColumn), issues, node.data.label, groupByColumn)
                                }
                            }
                            : node;
                    })
                }
            }
        }

        default: return state;
    }
}
