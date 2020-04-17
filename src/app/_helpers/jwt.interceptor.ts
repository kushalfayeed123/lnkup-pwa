import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticateDataService } from '../services/data/authenticate.data.service';
import { Select, Store } from '@ngxs/store';
import { AppState } from '../state/app.state';
import { Users } from '../models/Users';



@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  @Select(AppState.getLoggedInUser) loggedInUser$: Observable<Users>;
  currentUser: Users;

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    this.loggedInUser$.subscribe(res => {
      this.currentUser = res;
    });

    if (this.currentUser) {
      if (this.currentUser.token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${this.currentUser.token}`
          }
        });
      }
    }
    return next.handle(request);
  }
}
