import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PersistenceService } from './persistence.service';
import * as _ from "lodash";
import { Store } from '@ngrx/store';
import { AppState } from '../+state/app.state';
import { filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { ModeTypes } from '../+state/app.actions';

export const AuthenticationModeTypes = {
    JiraCloud: 0,
    JiraServer: 1
}

@Injectable({ providedIn: "root" })
export class JiraService {
    isOnlineMode = false;
    connectionDetails: any;
    proxyurl = "https://cors-anywhere.herokuapp.com";
    baseUrl = "https://storypurpose.atlassian.net/";
    restVersionEndpoint = "/rest/api/latest";
    fieldList = ['project', 'reporter', 'assignee', 'status', 'summary', 'description', 'key', 'components', 'labels', 'issuelinks', 'issuetype', 'parent'];
    httpOptions: any;

    staticFileLocation = './staticfiles';
    constructor(private http: HttpClient, public persistenceService: PersistenceService, public store$: Store<AppState>) {

        store$.select(p => p.app.mode)
            .subscribe(mode => this.isOnlineMode = mode && mode === ModeTypes.Online);

        store$.select(p => p.app.connectionDetails)
            .pipe(filter(p => p && p.verified))
            .subscribe(cd => {
                this.connectionDetails = cd;
                this.baseUrl = `${this.connectionDetails.serverUrl}${this.restVersionEndpoint}`;

                const pwd = this.connectionDetails.authenticationType === AuthenticationModeTypes.JiraCloud
                    ? this.connectionDetails.password
                    : btoa(this.connectionDetails.password);

                this.httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${this.persistenceService.encodeCredentials(this.connectionDetails.username, pwd)}`
                    })
                };
                // }
            })
    }

    testConnection(connectionDetails) {
        const pwd = connectionDetails.authenticationType === AuthenticationModeTypes.JiraCloud
            ? connectionDetails.password
            : btoa(connectionDetails.password);

        return this.http.get(`${this.proxyurl}/${connectionDetails.serverUrl}${this.restVersionEndpoint}/myself`,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${this.persistenceService.encodeCredentials(connectionDetails.username, pwd)}`
                })
            });
    }
    getIssueDetails(keyId, extendedFields = []) {
        if (this.isOnlineMode === false) {
            return this.http.get(`${this.staticFileLocation}/${keyId.toLowerCase()}.json`, this.httpOptions)
        }
        const fieldCodes = _.join(_.concat(this.fieldList, extendedFields));
        const url = `issue/${keyId}?fields=${fieldCodes}`;
        return this.http.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }
    getProjectDetails(projectKey) {
        if (this.isOnlineMode === false) {
            return this.http.get(`${this.staticFileLocation}/project-${projectKey}.json`, this.httpOptions)
        }
        const url = `project/${projectKey}`;
        return this.http.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }

    executeJql(jql, extendedFields = [], srcJson = null) {
        if (this.isOnlineMode === false && srcJson && srcJson.length > 0) {
            return this.http.get(`${this.staticFileLocation}/${srcJson}`, this.httpOptions)
        }
        const fieldCodes = _.join(_.concat(this.fieldList, extendedFields));
        const url = `search?jql=${jql}&fields=${fieldCodes}`;
        return this.http.get(`${this.proxyurl}/${this.baseUrl}/${url}`, this.httpOptions);
    }
}
