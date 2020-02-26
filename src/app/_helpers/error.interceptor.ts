import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticateDataService } from '../services/data/authenticate.data.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticateDataService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if ([401, 403].indexOf(err.status) !== -1) {
        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        this.authenticationService.logout();
        location.reload(true);
      }
      let error = err.statusText;
      console.log(err.message)
      if (err.statusText === 'Unknown Error') {
        error = 'It seems you are not connected to the internet, please check your network and try again';
      }
      return throwError(error);
    }));
  }
}



// if ([404].indexOf(err.status) !== -1) {
//   let error = err.message;
//   if (error === 'Unknown Error') {
//     error = 'It seems you are not connected to the internet, please check your network and try again';
//     console.log('error message', error);
//   } else {
//     error = error;
//   }
//   return throwError(error);
// }
