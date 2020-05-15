import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CachingService } from './caching.service';
import { JiraService } from './jira.service';
import { filter, map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticatedGuard implements CanActivate {
    constructor(private cachingService: CachingService,
        private jiraService: JiraService,
        private router: Router) { }

    canActivate = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean => {
        return this.connectionValidated();
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivate(route, state);
    }

    connectionValidated() {
        const conn = this.cachingService.getConnectionDetails();
        if (!conn || conn.verified) {
            return true;
        }
        const testedOk$ = this.jiraService.testConnection(conn)
            .pipe(catchError(err => {
                conn.verified = false;
                conn.password = null;
                this.cachingService.setConnectionDetails(conn);
                return of(null)
            }))
            .pipe(map(p => p !== null && p !== undefined));

        testedOk$.subscribe(() => this.router.navigate(["/browse"]));
        
        return testedOk$;
    }
}
