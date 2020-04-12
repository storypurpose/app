import { Injectable, EventEmitter } from "@angular/core";
import { AppRepository } from "./app.repository";
const CLIENT_ID = "973184059370-npufp2md2ipodegfqk98pfdbc4080g4n.apps.googleusercontent.com";
const API_KEY = "AIzaSyAbR95NtFUqwhNAQT264_YfR8WmsDRXzdU";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

@Injectable()
export class GapiSession {
    googleAuth: gapi.auth2.GoogleAuth;

    constructor(private appRepository: AppRepository) {
    }

    initClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', () => {
                return gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES,
                }).then(() => {
                    this.googleAuth = gapi.auth2.getAuthInstance();
                    resolve();
                });
            });
        });
    }
    get isSignedIn(): boolean {
        return this.googleAuth.isSignedIn.get();
    }

    signIn() {
        return this.googleAuth.signIn({ prompt: 'consent' })
            .then((googleUser: gapi.auth2.GoogleUser) => {
                this.appRepository.User.add(googleUser.getBasicProfile());
            });
    }

    signOut(): void {
        this.googleAuth.signOut();
    }
}