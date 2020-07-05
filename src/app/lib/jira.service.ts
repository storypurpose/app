import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from "lodash";
import { Store } from '@ngrx/store';
import { AppState } from '../+state/app.state';
import { filter, map, tap, find } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';
import { ModeTypes } from '../+state/app.actions';
import { fieldList, detailFields, attachmentField } from './jira-tree-utils';
import { environment } from '../../environments/environment';
import { values } from 'lodash';

export const AuthenticationModeTypes = {
    JiraCloud: 0,
    JiraServer: 1
}

@Injectable({ providedIn: "root" })
export class JiraService {
    isOnlineMode = false;
    connectionDetails: any;
    proxyurl = environment.proxyurl;
    baseUrl = "";
    restVersionEndpoint = "/rest/api/latest";
    // fieldList = ['project', 'reporter', 'assignee', 'status', 'summary', 'key', 'issuelinks', 'issuetype', 'parent',
    //     'created', 'updated', 'duedate', 'resolution'];
    // detailFields = ['description', 'components', 'labels', 'fixVersions'];
    // attachmentField = ['attachment'];
    httpOptions: any;

    staticFileLocation = './staticfiles';
    constructor(private httpClient: HttpClient, public store$: Store<AppState>) {

        store$.select(p => p.app.mode)
            .subscribe(mode => this.isOnlineMode = mode && mode === ModeTypes.Online);

        store$.select(p => p.app.connectionDetails)
            .pipe(filter(p => p)) // && p.verified
            .subscribe(cd => {
                this.connectionDetails = cd;
                this.baseUrl = `${this.connectionDetails.serverUrl}${this.restVersionEndpoint}`;
                this.httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${this.encodeCredentials(this.connectionDetails.username, this.connectionDetails.password)}`,
                        'X-Atlassian-Token': 'no-check'
                    })
                };
            })
    }

    encodeCredentials(username: string, password: string): any {
        return btoa(`${username}:${password}`)
    }

    testConnection(connectionDetails) {
        return this.httpClient.get(`${this.proxyurl}/${connectionDetails.serverUrl}${this.restVersionEndpoint}/myself`,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${this.encodeCredentials(connectionDetails.username, connectionDetails.password)}`,
                    'X-Atlassian-Token': 'no-check'
                })
            });
    }
    getIssueDetails(keyId, extendedFields = []) {
        if (this.isOnlineMode === false) {
            return this.httpClient.get(`${this.staticFileLocation}/${keyId.toLowerCase()}.json`, this.httpOptions)
        }
        const fieldCodes = _.join(_.concat(fieldList, detailFields, attachmentField, extendedFields));
        const url = `issue/${keyId}?fields=${fieldCodes}`;
        return this.httpClient.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }

    getComments(key) {
        if (this.isOnlineMode === false) {
            return this.httpClient.get(`${this.staticFileLocation}/comments.json`, this.httpOptions)
        }
        const url = `issue/${key}/comment`;
        return this.httpClient.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }
    addComment(payload) {
        if (this.isOnlineMode === false) {
            return this.httpClient.get(`${this.staticFileLocation}/comments.json`, this.httpOptions)
        }
        const url = `issue/${payload.key}/comment`;
        const data = { body: payload.comment }
        return this.httpClient.post(`${this.proxyurl}/${this.baseUrl}/${url}`, data, this.httpOptions);
    }

    getProjectDetails(projectKey) {
        let projectUrl$ = this.httpClient.get(`${this.proxyurl}/${this.baseUrl}/project/${projectKey}`, this.httpOptions);
        let fieldsUrl$ = this.httpClient.get(`${this.proxyurl}/${this.baseUrl}/field`, this.httpOptions);
        if (this.isOnlineMode === false) {
            projectUrl$ = this.httpClient.get(`${this.staticFileLocation}/project-${projectKey}.json`, this.httpOptions);
            fieldsUrl$ = this.httpClient.get(`${this.staticFileLocation}/field-${projectKey}.json`, this.httpOptions)
        }
        return combineLatest(projectUrl$, fieldsUrl$);
    }

    loadEpicChildren$(key, pageIndex = 0, pageSize = 10, extendedFields = [], srcJson = 'epic-children.json') {
        return this.executeJql(`('epic Link'=${key} or parent=${key})`, pageIndex, pageSize, extendedFields, srcJson);
    }
    executeJql(jql, pageIndex = 0, pageSize = 10, extendedFields = [], srcJson = null) {
        if (this.isOnlineMode === false && srcJson && srcJson.length > 0) {
            return this.httpClient.get(`${this.staticFileLocation}/${srcJson}`, this.httpOptions)
        }
        const startAt = pageIndex * pageSize;
        const fieldCodes = _.join(_.concat(fieldList, detailFields, extendedFields));
        const url = `search?jql=${jql}&fields=${fieldCodes}&startAt=${startAt}&maxResult=${pageSize}`;
        return this.httpClient.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }

    favouriteSearches(srcJson = null) {
        if (this.isOnlineMode === false && srcJson && srcJson.length > 0) {
            return this.httpClient.get(`${this.staticFileLocation}/${srcJson}`, this.httpOptions)
        }
        const url = `filter/favourite`;
        return this.httpClient.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }

    updateFieldValue$(payload) {
        const valueString = `{"update":{"${payload.fieldName}":[{"set": ${JSON.stringify(payload.updatedValue)}}]}}`;
        const data = JSON.parse(valueString);
        if (this.isOnlineMode) {
            return this.httpClient.put(`${this.proxyurl}/${this.baseUrl}/issue/${payload.issueKey}`, data, this.httpOptions);
        } else {
            return of(null);
        }
    }

    getIssueLinkTypes(srcJson = null) {
        if (this.isOnlineMode === false && srcJson && srcJson.length > 0) {
            return this.httpClient.get(`${this.staticFileLocation}/${srcJson}`, this.httpOptions)
        }
        const url = `issueLinkType`;
        return this.httpClient.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions)
            .pipe(
                filter((p: any) => p && p.issueLinkTypes),
                map(p => p.issueLinkTypes),
                tap(list => _.map(list, p => _.pick(p, ['name', 'inward', 'outward'])))
            );
    }
    getCreateIssueMetadata(projectCode, srcJson = null) {
        const issuetypeName = 'Story';
        if (this.isOnlineMode === false && srcJson && srcJson.length > 0) {
            return this.httpClient.get(`${this.staticFileLocation}/${srcJson}`, this.httpOptions)
        }
        const url = `issue/createmeta?projectKeys=${projectCode}&issuetypeNames=${issuetypeName}&expand=projects.issuetypes.fields`;
        return this.httpClient.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions)
            .pipe(
                filter((p: any) => p && p.projects),
                map(p => p.projects.find(project => project.key === projectCode)),
                tap(p => p = p || { issuetypes: [] }),
                map(p => p.issuetypes.find(it => it.name === issuetypeName)),
                tap(p => p = p || { fields: {} }),
                map(p => p.fields)
            );
    }
}
