import * as _ from 'lodash';
const MAX_LENGTH = 100;

export const TreeTemplateTypes = {
    Heading: 'Heading',
    Editable: 'Editable',
    Editing: 'Editing',
};

export const populatedFieldList = ['project', 'issueParent', 'issueType', 'assignee', 'status', 'summary', 'label', 'title', 'key',
    'icon', 'duedate', 'created', 'updated', 'resolution', 'description', 'components', 'labels', 'fixVersions', 'linkType'];
export const detailFields = ['description', 'components', 'labels', 'fixVersions'];
export const authorFields = ['key', 'name', 'displayName'];
export const fieldList = ['project', 'reporter', 'assignee', 'status', 'summary', 'key', 'issuelinks', 'issuetype', 'parent',
    'created', 'updated', 'duedate', 'resolution'];

export const attachmentField = ['attachment'];

export const ORG_PLACEHOLDER = "my_org";

export const CustomNodeTypes = {
    Organization: "Organization",
    Hierarchy: "Hierarchy",
    Project: "Project",

    EpicChildren: "EpicChildren",
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
        case CustomNodeTypes.Task: return "fa fa-receipt fa-sm fa-fw text-muted";
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

export function populateFieldValuesCompactWithExtendedFields(node, extendedFields) {
    const issueDetails: any = populateFieldValuesCompact(node);
    issueDetails.attachments = populateAttachments(node);
    issueDetails.extendedFields = populateExtendedFields(node, extendedFields);
    return issueDetails;
}

function populateExtendedFields(node: any, extendedFields: any) {
    const list = [];
    if (extendedFields && extendedFields.length > 0) {
        extendedFields.forEach(field => {
            field.extendedValue = getExtendedFieldValue(node, field.id);
            list.push(field);
        });
    }
    return list;
}

export function populateAttachments(node) {
    if (!node || !node.fields) return [];

    return _.sortBy(
        _.map(node.fields.attachment, (a) => {
            const record: any = _.pick(a, ['filename', 'content', 'thumbnail', 'mimeType', 'size', 'created']);
            record.author = a.author ? _.pick(a.author, authorFields) : {};
            return record;
        }), 'created'
    )
}

export function populateFieldValuesCompact(node) {
    if (node && node.fields) {
        const issueType = node.fields.issuetype ? node.fields.issuetype.name : 'unknown';
        return {
            key: node.key,
            project: _.pick(node.fields.project, ['id', 'key', 'name']),
            issueType,
            status: node.fields.status ? node.fields.status.name : 'unknown',
            label: _.truncate(node.fields.summary, { length: MAX_LENGTH }),
            title: node.fields.summary,
            icon: getIcon(issueType),
            duedate: node.fields.duedate,
            duedateMissing: node.fields.duedate && (new Date(node.fields.duedate) < new Date()),
            created: node.fields.created,
            updated: node.fields.updated,
            resolution: node.fields.resolution ? node.fields.resolution.name : null,
            assignee: _.pick(node.fields.assignee, ['key', 'name', 'displayName']),
            priority: node.fields.priority ? node.fields.priority.name : null,

            description: node.fields.description,
            labels: node.fields.labels,
            components: _.map(node.fields.components, 'name'),
            fixVersions: _.map(node.fields.fixVersions, 'name')
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
        node.duedate = node.fields.duedate;
        node.created = node.fields.created;
        node.updated = node.fields.updated;
        node.resolution = node.fields.resolution ? node.fields.resolution.name : null;

        node.assignee = _.pick(node.fields.assignee, ['key', 'name', 'displayName']);
        node.priority = node.fields.priority ? node.fields.priority.name : null;

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
    dest.duedate = src.duedate;
    dest.created = src.created;
    dest.updated = src.updated;
    dest.resolution = src.resolution;

    dest.assignee = src.assignee;

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

export function flattenComments(comments) {
    return _.map(comments, (comment) => flattenSingleComment(comment));
}
export function flattenSingleComment(comment: any) {
    const node: any = _.pick(comment, ['body', 'created', 'updated']);
    node.author = comment.author ? _.pick(comment.author, authorFields) : {};
    node.updateAuthor = comment.updateAuthor ? _.pick(comment.updateAuthor, authorFields) : {};
    return node;
}

export function flattenNodes(issues) {
    return _.map(issues, (item) => {
        populateFieldValues(item);
        const node = {
            key: item.key,
            title: item.fields.summary,
            label: _.truncate(item.fields.summary, { length: MAX_LENGTH }),
            issueType: item.issueType,
            description: item.description,
            status: item.status,
            project: item.project,
            created: item.created,
            updated: item.updated,
            duedate: item.duedate,
            resolution: item.resolution,
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

export function createOrganizationNode(organization) {
    if (organization) {
        return {
            key: organization.name,
            title: organization.name,
            label: organization.name,
            description: organization.purpose,
            type: TreeTemplateTypes.Heading,
            menuType: CustomNodeTypes.Organization,
            issueType: CustomNodeTypes.Organization,
            icon: getIcon(CustomNodeTypes.Organization),
            expanded: true,
            editable: false,
            selectable: false
        }
    } else {
        return {
            key: ORG_PLACEHOLDER,
            title: '',
            label: 'Organization',
            description: '',
            type: TreeTemplateTypes.Heading,
            menuType: CustomNodeTypes.Organization,
            issueType: CustomNodeTypes.Organization,
            expanded: true,
            editable: false,
            selectable: false
        }
    }
}

export function createProjectNode(project: any) {
    return {
        key: project.key,
        title: project.name,
        label: project.name,
        type: TreeTemplateTypes.Heading,
        description: project.description,
        issueType: CustomNodeTypes.Project,
        menuType: CustomNodeTypes.Project,
        icon: getIcon(CustomNodeTypes.Project),
        expanded: true,
        selectable: false
    };
}

export function createEpicChildrenNode(node: any): any {

    const children = node.epicChildren && node.epicChildren.length > 0 ? [] : null;
    node.epicChildren.forEach(u => children.push(u));
    const label = `${children ? children.length : ''} Epic children`;
    return {
        label, title: label, key: 'E_' + node.key, parentId: node.key, selectable: false,
        issueType: CustomNodeTypes.EpicChildren, leaf: false, children
    };
}

export function createHierarchyNode(found: any): any {
    return {
        key: found.name,
        title: found.extendedValue,
        label: found.extendedValue,
        description: found.description,
        icon: getIcon(CustomNodeTypes.Hierarchy),
        issueType: found.name,
        hfKey: found.id,
        children: [],
        expanded: true,
        editable: false,
        isHierarchyField: true,
        selectable: false,
        type: TreeTemplateTypes.Heading,
        menuType: CustomNodeTypes.Hierarchy
    };
}

export function convertToTree(list, tree) {
    const subset = list.splice(1, list.length - 1);
    tree.children = subset;
    if (subset && subset.length > 0) {
        convertToTree(subset, subset[0]);
    }
}

export function addToLeafNode(node, nodeToAdd) {
    if (node && nodeToAdd) {
        if (node.children && node.children.length === 1) {
            addToLeafNode(node.children[0], nodeToAdd);
        } else {
            node.children = node.children || [];
            node.children.push(nodeToAdd);
        }
    }
    return node || nodeToAdd;
}



export function buildIssueLinkGroups(children: any, issueKey) {
    const grouped = _.groupBy(children, 'linkType');
    children = Object.keys(grouped).map(key => {
        return {
            "label": key, title: `${key} ${grouped[key].length} issues`, key: `RL_${issueKey}`, parentId: issueKey,
            selectable: false, issueType: CustomNodeTypes.RelatedLink,
            children: grouped[key], expanded: true
        }
    })
    return children;
}

export function getIssueLinks(node: any) {
    if (node && node.fields && node.fields.issuelinks && node.fields.issuelinks.length > 0) {
        const inwardIssues = _.filter(node.fields.issuelinks, (il) => il.inwardIssue);
        let children: any = [];
        if (inwardIssues && inwardIssues.length > 0) {
            children = _.union(children, _.map(inwardIssues, (il) => {
                const issue: any = populateFieldValuesCompact(il.inwardIssue);
                issue.linkType = (il.type) ? il.type.inward : 'link';
                return issue;
            }));
        }
        const outwardIssues = _.filter(node.fields.issuelinks, (il) => il.outwardIssue);
        if (outwardIssues && outwardIssues.length > 0) {
            children = _.union(children, _.map(outwardIssues, (il) => {
                const issue: any = populateFieldValuesCompact(il.outwardIssue);
                issue.linkType = (il.type) ? il.type.outward : 'link';
                return issue;
            }));
        }
        if (node.project && node.project.key) {
            children.forEach(u => u.project = node.project);
        }
        return children;
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
    return (node && issueType)
        ? searchTree(node, issueType, (n, it) => n.issueType.toLowerCase() === it.toLowerCase())
        : null;
}
export function searchTreeByKey(node, key) {
    return (node && key)
        ? searchTree(node, key, (n, it) => n.key.toLowerCase() === it.toLowerCase())
        : null;
}
