import * as _ from 'lodash';
const MAX_LENGTH = 40;

export const CustomNodeTypes = {
    EpicChildren: "epic-children",
    RelatedLink: "RelatedLink",
    Project: "Project",
    Issue: "Issue",
    Hierarchy: "Hierarchy",
    Organization: "Organization",
    TestSuite: "Test Suite",
    Epic: "Epic",
    Story: "Story",
    TestCase: "ST-Test Case",
    SubTask: "ST-Technical task"
};

export function getIcon(issueType) {
    switch (issueType) {
        case CustomNodeTypes.Organization: return "fa fa-building text-dark";
        case CustomNodeTypes.Project: return "far fa-snowflake text-dark";
        case CustomNodeTypes.TestSuite: return "fa fa-flask text-warning";
        case CustomNodeTypes.Epic: return "fa fa-book text-primary";
        case CustomNodeTypes.Story: return "fa fa-file text-info";
        default: "far fa-file"
    }
}

export function isCustomNode(args) {
    return args.issueType === CustomNodeTypes.EpicChildren || args.issueType === CustomNodeTypes.RelatedLink
        || args.issueType === CustomNodeTypes.Organization || args.issueType === CustomNodeTypes.Project
        || args.issueType === CustomNodeTypes.Hierarchy
}

export function populateFieldValues(node) {
    if (node && node.fields) {
        node.project = _.pick(node.fields.project, ['id', 'key', 'name']);
        node.issueParent = populateFieldValues(node.fields.parent);
        node.issueType = node.fields.issuetype ? node.fields.issuetype.name : 'unknown';
        node.status = node.fields.status ? node.fields.status.name : 'unknown';
        node.label = _.truncate(node.fields.summary, { length: MAX_LENGTH });
        node.title = node.fields.summary;
        node.description = node.fields.description;
        node.icon = getIcon(node.issueType);
    }
    return node;
}

export function appendExtendedFields(flattenedNodes, extendedFields) {
    if (flattenedNodes) {
        _.forEach(flattenedNodes, element => {
            element.extendedFields = _.filter(
                _.map(extendedFields, (ef) => { return { name: ef.name, value: getExtendedFieldValue(element.issue, ef.id) } }),
                (ef) => ef && ef.value !== '')
        });
    }
}
export function getExtendedFieldValue(issue, code) {
    if (!issue || !issue.fields) return '';

    const field = issue.fields[code];
    if (!field) return '';

    return (typeof field === 'object') ? field.value : field;
}

export function flattenNodes(issues) {
    return _.map(issues, (item) => {
        populateFieldValues(item);
        const node = {
            key: item.key,
            title: item.fields.summary,
            label: _.truncate(item.fields.summary, { length: MAX_LENGTH }),
            issueType: item.issueType,
            status: item.status,
            project: item.project,
            issueParent: item.issueParent,
            issue: item
        };
        return node;
    });
}

export function flattenAndTransformNodes(issues) {
    return _.map(issues, (item) => transformParentNode(item));
}
export function transformToTreenode(node, issueLinks) {
    if (!node.issueType) {
        populateFieldValues(node);
    }

    if (issueLinks && issueLinks.length > 0) {
        node.children = issueLinks;
        node.expanded = true;
    }
    return node;
}

export function transformParentNode(node) {
    if (!node.issueType) {
        populateFieldValues(node);
    }

    let level1Nodes: any = [];
    if (node.issueType === CustomNodeTypes.Epic) {
        level1Nodes.push({
            "label": 'Epic Children', key: 'E_' + node.key, parentId: node.key, selectable: false,
            issueType: CustomNodeTypes.EpicChildren, leaf: false, children: null
        });
    }
    let issueLinks = buildIssueLinks(node);
    if (issueLinks && issueLinks.length > 0) {
        level1Nodes = _.concat(level1Nodes, issueLinks);
    }

    return transformToTreenode(node, level1Nodes);
}

function buildIssueLinks(node: any) {
    if (node && node.fields && node.fields.issuelinks && node.fields.issuelinks.length > 0) {
        const issueLinks: any = [];
        const inwardIssues = _.filter(node.fields.issuelinks, (il) => il.inwardIssue);
        let children: any = [];
        if (inwardIssues && inwardIssues.length > 0) {
            children = _.union(children, _.map(inwardIssues, (il) => populateFieldValues(il.inwardIssue)));
        }
        const outwardIssues = _.filter(node.fields.issuelinks, (il) => il.outwardIssue);
        if (outwardIssues && outwardIssues.length > 0) {
            children = _.union(children, _.map(outwardIssues, (il) => populateFieldValues(il.outwardIssue)));
        }
        if (children.length > 0) {
            issueLinks.push({
                "label": `Related links`, title: `${children.length} items linked`, key: 'RL_' + node.key, parentId: node.key,
                selectable: false, issueType: CustomNodeTypes.RelatedLink,
                "children": children,
                expanded: false
            });

        }
        return issueLinks;
    }
    return null;
}

export function findInTree(node, key) {
    if (node) {
        if (node.key.toLowerCase() === key.toLowerCase()) return node;

        if (node.children) {
            node.children.forEach((cn) => node = findInTree(cn, key));
        }
    }
    return node;
}