import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PersistenceService } from './persistence.service';
import * as _ from "lodash";
import { Store } from '@ngrx/store';
import { AppState } from '../+state/app.state';
import { filter } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';
import { ModeTypes } from '../+state/app.actions';

import { environment } from '../../environments/environment';

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
    fieldList = ['project', 'reporter', 'assignee', 'status', 'summary', 'key', 'issuelinks', 'issuetype', 'parent'];
    detailFields = ['description', 'components', 'labels', 'fixVersions'];
    httpOptions: any;

    staticFileLocation = './staticfiles';
    constructor(private http: HttpClient, public persistenceService: PersistenceService, public store$: Store<AppState>) {

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
                        'Authorization': `Basic ${this.persistenceService.encodeCredentials(this.connectionDetails.username, this.connectionDetails.password)}`
                    })
                };
                console.log('cd', cd, this.baseUrl);
            })
    }

    testConnection(connectionDetails) {
        return this.http.get(`${this.proxyurl}/${connectionDetails.serverUrl}${this.restVersionEndpoint}/myself`,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${this.persistenceService.encodeCredentials(connectionDetails.username, connectionDetails.password)}`
                })
            });
    }
    getIssueDetails(keyId, extendedFields = []) {
        extendedFields.push('description');
        if (this.isOnlineMode === false) {
            return this.http.get(`${this.staticFileLocation}/${keyId.toLowerCase()}.json`, this.httpOptions)
        }
        const fieldCodes = _.join(_.concat(this.fieldList, this.detailFields, extendedFields));
        const url = `issue/${keyId}?fields=${fieldCodes}`;
        console.log('getIssueDetails', this.baseUrl, url);
        return this.http.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }
    getProjectDetails(projectKey) {
        let projectUrl$ = this.http.get(`${this.proxyurl}/${this.baseUrl}/project/${projectKey}`, this.httpOptions);
        let fieldsUrl$ = this.http.get(`${this.proxyurl}/${this.baseUrl}/field`, this.httpOptions);
        if (this.isOnlineMode === false) {
            projectUrl$ = this.http.get(`${this.staticFileLocation}/project-${projectKey}.json`, this.httpOptions);
            fieldsUrl$ = this.http.get(`${this.staticFileLocation}/field-${projectKey}.json`, this.httpOptions)
        }
        return combineLatest(projectUrl$, fieldsUrl$);
    }

    executeJql(jql, pageIndex = 0, pageSize = 10, extendedFields = [], srcJson = null) {
        if (this.isOnlineMode === false && srcJson && srcJson.length > 0) {
            return this.http.get(`${this.staticFileLocation}/${srcJson}`, this.httpOptions)
        }
        const startAt = pageIndex * pageSize;
        const fieldCodes = _.join(_.concat(this.fieldList, extendedFields));
        const url = `search?jql=${jql}&fields=${fieldCodes}&startAt=${startAt}&maxResult=${pageSize}`;
        return this.http.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }
}
