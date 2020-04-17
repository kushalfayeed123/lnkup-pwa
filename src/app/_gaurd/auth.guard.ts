import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticateDataService } from '../services/data/authenticate.data.service';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { AppState } from '../state/app.state';
import { Users } from '../models/Users';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    @Select(AppState.getCurrentUser) loggedInUser$: Observable<any>;

    constructor(private router: Router, private authenticateService: AuthenticateDataService) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        let userRole = '';
        this.loggedInUser$.subscribe(res => {
            userRole = res.role;
        });
        if (userRole === route.data.role) {
            return true;
        }

        //not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}