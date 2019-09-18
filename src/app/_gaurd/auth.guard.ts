import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticateDataService } from '../services/data/authenticate.data.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor (private router: Router, private authenticateService: AuthenticateDataService){

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        let userRole = <any>{};
        userRole = this.authenticateService.decode();

        if (userRole.role === route.data.role) {
            return true;
        }

        //not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}