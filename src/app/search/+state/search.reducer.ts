import * as _ from 'lodash';
import { Search } from './search.state';
import { ActionTypes } from './search.actions';
import * as roadmapUtil from 'src/app/lib/roadmap-utils'
import { populateFieldValuesCompact } from 'src/app/lib/jira-tree-utils';
import { populateStatistics, extractMetadata } from 'src/app/lib/statistics-utils';

export function searchReducer(state: Search, action: any): Search {
    switch (action.type) {
        case ActionTypes.SetQueryContext: {
            return { ...state, queryContext: action.payload };
        }
        case ActionTypes.LoadSearchResults: {
            return { ...state, issuelist: [] };
        }
        case ActionTypes.LoadSearchResultsSuccess: {
            return { ...state, issuelist: action.payload };
        }

        case ActionTypes.LoadSavedSearchlist: {
            return { ...state, savedSearchlist: [] };
        }

        case ActionTypes.LoadSavedSearchlistSuccess: {
            const savedSearchlist = _.map(action.payload, item => _.pick(item, ['id', 'name', 'jql']));
            return { ...state, savedSearchlist };
        }

        case ActionTypes.PopulateSearchResultRoadmapView: {
            const metadata = roadmapUtil.populateMetadata(action.payload);
            const records = roadmapUtil.transformToTreeChildren(action.payload, metadata.timespan);
            return { ...state, roadmapView: { metadata, records } };
        }
        
        case ActionTypes.LoadSearchResultRoadmapNodeSuccess: {
            const issueKey = action.payload.issueKey;
            const issues = action.payload.payload && action.payload.payload.issues
                ? _.map(action.payload.payload.issues, p => populateFieldValuesCompact(p))
                : [];
            const children = roadmapUtil.transformToTreeChildren(issues, state.roadmapView.metadata.timespan);
            return {
                ...state, roadmapView: {
                    ...state.roadmapView, records: state.roadmapView.records.map(node => {
                        return (node && node.data && node.data.key === issueKey)
                            ? {
                                ...node, children, data: {
                                    ...node.data,
                                    isHeading: children && children.length > 0,
                                    statistics: populateStatistics(extractMetadata(issues), issues, node.data.label)
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
