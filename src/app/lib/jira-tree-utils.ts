import * as _ from 'lodash';
const MAX_LENGTH = 100;

export const CustomNodeTypes = {
    Organization: "Organization",
    Hierarchy: "Hierarchy",
    Project: "Project",

    EpicChildren: "epic-children",
    RelatedLink: "RelatedLink",
    Issue: "Issue",

    TestSuite: "Test Suite",
    Epic: "Epic",
    Story: "Story",
    TestCase: "ST-Test Case",
    SubTask: "ST-Technical task",
    Task: "Task"
};

export function getIcon(issueType) {
    switch (issueType) {
        case CustomNodeTypes.Organization:
        case CustomNodeTypes.Hierarchy: return "";

        // case CustomNodeTypes.Organization: return  "fa fa-building fa-sm text-dark";
        // case CustomNodeTypes.Hierarchy: return "fa fa-share-alt fa-sm text-dark";
        case CustomNodeTypes.Project: return "fa fa-bookmark fa-sm fa-fw text-info";
        case CustomNodeTypes.Epic: return "fa fa-copy fa-sm fa-fw ";
        case CustomNodeTypes.Story: return "far fa-file-alt fa-sm fa-fw ";
        case CustomNodeTypes.Task: return "fa fa-check fa-sm fa-fw";
        case CustomNodeTypes.TestSuite: return "fa fa-flask fa-sm fa-fw text-muted";
        default: return "far fa-file fa-sm fa-fw"
    }
    return '';
}

export function isCustomNode(args) {
    return args.issueType === CustomNodeTypes.EpicChildren || args.issueType === CustomNodeTypes.RelatedLink
}
export function isHeaderNode(args) {
    return args.issueType === CustomNodeTypes.Organization ||
        args.issueType === CustomNodeTypes.Project ||
        args.issueType === CustomNodeTypes.Hierarchy;
}

export function isCustomMenuType(args) {
    return args.menuType === CustomNodeTypes.Organization ||
        args.menuType === CustomNodeTypes.Project ||
        args.menuType === CustomNodeTypes.Hierarchy ||
        args.menuType === CustomNodeTypes.Epic;
}

export function populateFieldValuesCompact(node) {
    if (node && node.fields) {
        return {
            key: node.key,
            issueType: node.fields.issuetype ? node.fields.issuetype.name : 'unknown',
            status: node.fields.status ? node.fields.status.name : 'unknown',
            title: node.fields.summary,
            icon: getIcon(node.issueType)
        }
    }
    return null;
}
export function populateFieldValues(node) {
    if (node && node.fields) {
        node.project = _.pick(node.fields.project, ['id', 'key', 'name']);
        node.issueParent = populateFieldValues(node.fields.parent);
        node.issueType = node.fields.issuetype ? node.fields.issuetype.name : 'unknown';
        node.status = node.fields.status ? node.fields.status.name : 'unknown';
        node.label = _.truncate(node.fields.summary, { length: MAX_LENGTH });
        node.title = node.fields.summary;
        node.icon = getIcon(node.issueType);

        node.description = node.fields.description;
        node.labels = node.fields.labels;
        node.components = _.map(node.fields.components, 'name');
        node.fixVersions = _.map(node.fields.fixVersions, 'name');
    }
    return node;
}

export function copyFieldValues(src, dest) {
    if (!src) return dest;
    if (!dest && src) {
        dest = _.clone(src);
        return dest;
    }
    dest.project = src.project;
    dest.issueParent = src.issueParent;
    dest.issueType = src.issueType;
    dest.status = src.status;
    dest.label = src.label;
    dest.title = src.title;
    dest.description = src.description;
    dest.icon = src.icon;

    dest.description = src.description;
    dest.components = src.components;
    dest.labels = src.labels;
    dest.fixVersions = src.fixVersions;
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

export function transformParentNode(node, linkedIssues) {
    if (!node.issueType) {
        populateFieldValues(node);
    }

    let level1Nodes: any = [];
    if (node.issueType === CustomNodeTypes.Epic) {
        level1Nodes.push(createEpicChildrenNode(node));
    }

    if (linkedIssues && linkedIssues.length > 0) {
        level1Nodes = _.concat(level1Nodes, linkedIssues);
    }

    return transformToTreenode(node, level1Nodes);
}

export function createEpicChildrenNode(node: any): any {
    return {
        label: "Epic Children", title: "Epic Children", key: 'E_' + node.key, parentId: node.key, selectable: false,
        issueType: CustomNodeTypes.EpicChildren, leaf: false, children: null
    };
}

export function buildIssueLinks(node: any) {
    if (node && node.fields && node.fields.issuelinks && node.fields.issuelinks.length > 0) {
        const issueLinks: any = [];
        const inwardIssues = _.filter(node.fields.issuelinks, (il) => il.inwardIssue);
        let children: any = [];
        if (inwardIssues && inwardIssues.length > 0) {
            children = _.union(children, _.map(inwardIssues, (il) => {
                const issue = populateFieldValues(il.inwardIssue);
                issue.linkType = (il.type) ? il.type.inward : 'link'
                return issue;
            }));
        }
        const outwardIssues = _.filter(node.fields.issuelinks, (il) => il.outwardIssue);
        if (outwardIssues && outwardIssues.length > 0) {
            children = _.union(children, _.map(outwardIssues, (il) => {
                const issue = populateFieldValues(il.outwardIssue);
                issue.linkType = (il.type) ? il.type.outward : 'link'
                return issue;
            }));
        }
        if (node.project && node.project.key) {
            children.forEach(u => u.project = node.project);
        }
        if (children.length > 0) {
            issueLinks.push({
                "label": `Related issues`, title: `${children.length} issues linked`, key: `RL_${node.key}`, parentId: node.key,
                selectable: false, issueType: CustomNodeTypes.RelatedLink,
                "children": children,
                expanded: true
            });

        }
        return issueLinks;
    }
    return null;
}

function searchTree(node, valueToCompare, match) {
    if (match(node, valueToCompare)) {
        return node;
    } else if (node.children) {
        let result = null;
        for (let i = 0; result == null && i < node.children.length; i++) {
            result = searchTree(node.children[i], valueToCompare, match);
        }
        return result;
    }
    return null;
}

export function searchTreeByIssueType(node, issueType) {
    console.log('searchTreeByIssueType', node, issueType);
    return searchTree(node, issueType, (n, it) => n.issueType.toLowerCase() === it.toLowerCase())
}
export function searchTreeByKey(node, key) {
    console.log('searchTreeByKey', node, key);
    return searchTree(node, key, (n, it) => n.key.toLowerCase() === it.toLowerCase())
}