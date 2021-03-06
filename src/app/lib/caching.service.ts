import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { CustomNodeTypes } from './jira-tree-utils';
import * as CryptoJS from 'crypto-js';

const DataTypes = {
    Mode: "Mode",
    ConnectionDetails: "ConnectionDetails",
    Credentials: "Credentials",
    Organization: "Organization",
    Projects: "Projects",
    ExtendedHierarchy: "ExtendedHierarchy"
}

@Injectable({ providedIn: "root" })
export class CachingService {

    secretKey = "storepurpose";

    encrypt = (value: string) => CryptoJS.AES.encrypt(value, this.secretKey).toString();

    decrypt = (textToDecrypt) => CryptoJS.AES.decrypt(textToDecrypt, this.secretKey).toString(CryptoJS.enc.Utf8);

    //#region Connectiondetails
    getConnectionDetails() {

        const persistedCredentials = sessionStorage.getItem(DataTypes.Credentials);
        const credentials = JSON.parse(persistedCredentials);

        const payload = localStorage.getItem(DataTypes.ConnectionDetails);
        const connectionDetails = JSON.parse(payload);
        if (connectionDetails && credentials) {
            connectionDetails.username = credentials.username;
            connectionDetails.password = credentials.password;
            connectionDetails.verified = credentials.verified;
            connectionDetails.displayName = credentials.displayName;
        }

        if (connectionDetails && connectionDetails.password && connectionDetails.password.length > 0) {
            connectionDetails.password = this.decrypt(connectionDetails.password);
        }
        return connectionDetails;
    }

    setConnectionDetails(payload) {
        const credentials = _.pick(payload, ['username', 'password', 'verified', 'displayName']);

        if (credentials && credentials.password && credentials.password.length > 0) {
            credentials.password = this.encrypt(credentials.password);
            sessionStorage.setItem(DataTypes.Credentials, JSON.stringify(credentials))
        }

        if (payload) {
            payload.username = undefined;
            payload.password = undefined;
            payload.verified = undefined;
            payload.displayName = undefined;
        }
        localStorage.setItem(DataTypes.ConnectionDetails, JSON.stringify(payload))
    }
    resetConnectionDetails() {
        localStorage.removeItem(DataTypes.ConnectionDetails);
        sessionStorage.removeItem(DataTypes.Credentials);
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
