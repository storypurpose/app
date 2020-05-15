import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { CustomNodeTypes } from './jira-tree-utils';
import * as CryptoJS from 'crypto-js';

const DataTypes = {
    Mode: "Mode",
    ConnectionDetails: "ConnectionDetails",
    Organization: "Organization",
    // FieldMapping: "FieldMapping",
    Projects: "Projects",
    Initiatives: "Initiatives",
    ExtendedHierarchy: "ExtendedHierarchy"
}

@Injectable({ providedIn: "root" })
export class CachingService {

    secretKey = "storepurpose";

    encrypt = (value: string) => CryptoJS.AES.encrypt(value, this.secretKey).toString();

    decrypt = (textToDecrypt) => CryptoJS.AES.decrypt(textToDecrypt, this.secretKey).toString(CryptoJS.enc.Utf8);

    //#region Connectiondetails
    getConnectionDetails() {
        const payload = localStorage.getItem(DataTypes.ConnectionDetails);
        const connectionDetails = JSON.parse(payload);

        if (connectionDetails && connectionDetails.password && connectionDetails.password.length > 0) {
            connectionDetails.password = this.decrypt(connectionDetails.password);
        }
        return connectionDetails;
    }
    // encodeCredentials(username, password): any {
    //     return btoa(`${username}:${password}`)
    // }
    setConnectionDetails(payload) {
        if (payload && payload.password && payload.password.length > 0) {
            payload.password = this.encrypt(payload.password);
        }
        localStorage.setItem(DataTypes.ConnectionDetails, JSON.stringify(payload))
    }
    resetConnectionDetails() {
        localStorage.removeItem(DataTypes.ConnectionDetails);
    }
    //#endregion

    //#region mode
    getMode() {
        const payload = localStorage.getItem(DataTypes.Mode);
        return JSON.parse(payload) || 'online';
    }
    setMode(payload) {
        localStorage.setItem(DataTypes.Mode, JSON.stringify(payload))
    }
    resetMode() {
        localStorage.removeItem(DataTypes.Mode);
    }
    //#endregion

    //#region organization
    getOrganization() {
        const payload = localStorage.getItem(DataTypes.Organization);
        return JSON.parse(payload);
    }
    setOrganization(payload) {
        localStorage.setItem(DataTypes.Organization, JSON.stringify(payload))
    }
    resetOrganization() {
        localStorage.removeItem(DataTypes.Organization);
    }
    //#endregion 

    //#region FieldMapping
    // getFieldMapping() {
    //     const payload = localStorage.getItem(DataTypes.FieldMapping);
    //     const fieldMapping = JSON.parse(payload) || {
    //         epicLink: { support: false, name: 'Epic Link', value: '' }
    //     };

    //     fieldMapping.hierarchy = fieldMapping.hierarchy || { support: false, name: CustomNodeTypes.Hierarchy, list: [] };
    //     fieldMapping.issueTypes = fieldMapping.issueTypes || [];
    //     return fieldMapping;

    // }
    // setFieldMapping(payload) {
    //     localStorage.setItem(DataTypes.FieldMapping, JSON.stringify(payload))
    // }
    // resetFieldMapping() {
    //     localStorage.removeItem(DataTypes.FieldMapping);
    // }

    // getExtendedFieldByIssueType(issueType) {
    //     const customFields = this.getFieldMapping();
    //     if (customFields && customFields.issueTypes && customFields.issueTypes.length > 0) {
    //         const node = _.find(customFields.issueTypes, { name: issueType });
    //         if (node && node.list && node.list.length > 0) {
    //             return node.list;
    //         }
    //     }
    //     return [];
    // }
    //#endregion

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
    getExtendedHierarchy() {
        const payload = localStorage.getItem(DataTypes.ExtendedHierarchy);
        return JSON.parse(payload) || [];
    }
    setExtendedHierarchy(hierarchies) {
        localStorage.setItem(DataTypes.ExtendedHierarchy, JSON.stringify(hierarchies))
    }
    resetExtendedHierarchy() {
        localStorage.removeItem(DataTypes.ExtendedHierarchy);
    }
    getExtendedHierarchyDetails(hfKey, key) {
        const hierarchies = this.getExtendedHierarchy();
        return _.find(hierarchies, { key: key, hfKey: hfKey })
    }
    setExtendedHierarchyDetails(payload) {
        const hierarchies = this.getExtendedHierarchy();
        const found = _.find(hierarchies, { key: payload.key, hfKey: payload.hfKey })
        if (found) {
            found.purpose = payload.purpose;
        } else {
            hierarchies.push(payload);
        }
        localStorage.setItem(DataTypes.ExtendedHierarchy, JSON.stringify(hierarchies))
    }
    //#endregion

}
