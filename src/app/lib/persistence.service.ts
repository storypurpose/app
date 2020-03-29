import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { CustomNodeTypes } from './tree-utils';

const DataTypes = {
    Mode: "Mode",
    ConnectionDetails: "ConnectionDetails",
    Organization: "Organization",
    FieldMapping: "FieldMapping",
    Projects: "Projects",
    Initiatives: "Initiatives",
    HierarchyFields: "HierarchyFields"
}

@Injectable({ providedIn: "root" })
export class PersistenceService {

    //#region Connectiondetails
    getConnectionDetails() {
        const payload = localStorage.getItem(DataTypes.ConnectionDetails);
        const connectionDetails = JSON.parse(payload);
        if (connectionDetails && connectionDetails.password && connectionDetails.password.length > 0) {
            connectionDetails.encoded = btoa(`${connectionDetails.username}:${connectionDetails.password}`);
        }
        return connectionDetails;
    }
    encodeCredentials(username, password): any {
        return btoa(`${username}:${password}`)
    }
    setConnectionDetails(payload) {
        // if (payload && payload.password && payload.password.length > 0) {
        //     payload.password = btoa(payload.password);
        // }
        localStorage.setItem(DataTypes.ConnectionDetails, JSON.stringify(payload))
    }
    resetConnectionDetails() {
        localStorage.removeItem(DataTypes.ConnectionDetails);
    }
    //#endregion

    //#region mode
    getMode() {
        const payload = localStorage.getItem(DataTypes.Mode);
        return JSON.parse(payload) || 'offline';
    }
    setMode(payload) {
        localStorage.setItem(DataTypes.Mode, JSON.stringify(payload))
    }
    resetMode() {
        localStorage.removeItem(DataTypes.Mode);
    }
    //#endregion

    //#region organization
    getOrganizationDetails() {
        const payload = localStorage.getItem(DataTypes.Organization);
        return JSON.parse(payload);
    }
    setOrganizationDetails(payload) {
        localStorage.setItem(DataTypes.Organization, JSON.stringify(payload))
    }
    resetOrganizationDetails() {
        localStorage.removeItem(DataTypes.Organization);
    }
    //#endregion 

    getFieldMapping() {
        const payload = localStorage.getItem(DataTypes.FieldMapping);
        const fieldMapping = JSON.parse(payload) || {
            epicLink: { support: false, name: 'Epic Link', value: '' }
        };

        fieldMapping.hierarchy = fieldMapping.hierarchy || { support: false, name: CustomNodeTypes.Hierarchy, list: [] };
        fieldMapping.issueTypes = fieldMapping.issueTypes || [];
        return fieldMapping;

    }
    setFieldMapping(payload) {
        localStorage.setItem(DataTypes.FieldMapping, JSON.stringify(payload))
    }
    resetFieldMapping() {
        localStorage.removeItem(DataTypes.FieldMapping);
    }

    getExtendedFieldByIssueType(issueType) {
        const customFields = this.getFieldMapping();
        if (customFields && customFields.issueTypes && customFields.issueTypes.length > 0) {
            const node = _.find(customFields.issueTypes, { name: issueType });
            if (node && node.list && node.list.length > 0) {
                return node.list;
            }
        }
        return [];
    }

    //#region Projects
    getProjects() {
        const payload = localStorage.getItem(DataTypes.Projects);
        return JSON.parse(payload) || [];
    }
    resetProjects() {
        localStorage.removeItem(DataTypes.Projects);
    }
    setProjects(projects) {
        localStorage.setItem(DataTypes.Projects, JSON.stringify(projects))
    }
    getProjectDetails(keyId) {
        const projects = this.getProjects();
        return _.find(projects, { key: keyId })
    }
    setProjectDetails(payload) {
        const projects = this.getProjects();
        _.remove(projects, { key: payload.key });

        projects.push(payload);
        localStorage.setItem(DataTypes.Projects, JSON.stringify(projects))
    }
    //#endregion

    //#region HierarchyFields
    getHierarchyFields() {
        const payload = localStorage.getItem(DataTypes.HierarchyFields);
        return JSON.parse(payload) || [];
    }
    resetHierarchyFields() {
        localStorage.removeItem(DataTypes.HierarchyFields);
    }
    getHierarchyFieldDetails(hfKey, key) {
        const hierarchyFields = this.getHierarchyFields();
        return _.find(hierarchyFields, { key: key, hfKey: hfKey })
    }
    setHierarchyFieldDetails(payload) {
        const hierarchyFields = this.getHierarchyFields();
        const found = _.find(hierarchyFields, { key: payload.key, hfKey: payload.hfKey })
        if (found) {
            found.purpose = payload.purpose;
        } else {
            hierarchyFields.push(payload);
        }
        localStorage.setItem(DataTypes.HierarchyFields, JSON.stringify(hierarchyFields))
    }
    //#endregion

}
