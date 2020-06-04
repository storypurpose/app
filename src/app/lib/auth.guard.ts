import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { AppState } from '../+state/app.state';
import { Store } from '@ngrx/store';
import { VerifyCurrentSessionAction } from '../+state/app.actions';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticatedGuard implements CanActivate {
    connectionVerified = false;
    connectionDetails$: Observable<any>;

    constructor(private router: Router, private store$: Store<AppState>) {
        this.connectionDetails$ = this.store$.select(p => p.app.currentSessionVerified)
            .pipe(filter(p => p !== null));

        this.connectionDetails$.subscribe((isValid) => {
            this.connectionVerified = isValid;
            if (!isValid) {
                this.router.navigate(['/setup']);
            }
        })
    }

    canActivate = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean => {
        if (environment.production) {
            if (this.connectionVerified === true) {
                return true;
            }
            this.store$.dispatch(new VerifyCurrentSessionAction(state.url));
            return this.connectionDetails$;
        } else {
            return true;

        }
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivate(route, state);
    }
}
