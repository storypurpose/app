import * as _ from 'lodash';
import { Search } from './search.state';
import { ActionTypes } from './search.actions';
import * as roadmapUtil from 'src/app/lib/roadmap-utils'
import { populateFieldValuesCompact } from 'src/app/lib/jira-tree-utils';

export function searchReducer(state: Search, action: any): Search {
    switch (action.type) {
        case ActionTypes.SwitchViewmode: {
            return { ...state, viewmode: action.payload };
        }
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
            return { ...state, roadmapView: prepareRoadmapView(action.payload) };
        }
        case ActionTypes.LoadSearchResultRoadmapNodeSuccess: {
            const issueKey = action.payload.issueKey;
            const issues = action.payload.payload && action.payload.payload.issues
                ? _.map(action.payload.payload.issues, p => populateFieldValuesCompact(p))
                : [];
            const children = roadmapUtil.transformToTreeChildren(issues, state.roadmapView.metadata);
            return {
                ...state, roadmapView: {
                    ...state.roadmapView, records: state.roadmapView.records.map(node => {
                        return (node && node.data && node.data.key === issueKey)
                            ? { ...node, children, data: { ...node.data, isHeading: children && children.length > 0 } }
                            : node;
                    })
                }
            }
        }

        default: return state;
    }
}
function prepareRoadmapView(payload) {
    const metadata = roadmapUtil.populateMetadata(payload);
    const records = roadmapUtil.transformToTreeChildren(payload, metadata.timespan);
    return { metadata, records }
}
