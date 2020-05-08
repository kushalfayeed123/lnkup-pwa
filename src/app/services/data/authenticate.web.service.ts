
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, config } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticateDataService } from './authenticate.data.service';
import { Users } from 'src/app/models/Users';
import * as jwt_decode from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { Store } from '@ngxs/store';
import { GetLoggedInUser } from 'src/app/state/app/app.actions';
import { StateClear } from 'ngxs-reset-plugin';




@Injectable({ providedIn: 'root' })
export class AuthenticateWebService implements AuthenticateDataService {

  public webUrl: string;
  private currentUserSubject: BehaviorSubject<Users>;
  public currentUser: Observable<Users>;
  public registerUrl: string;
  private loggedIn = new BehaviorSubject<boolean>(false);
  mockUrl: string;
  userToken: any;

  constructor(private http: HttpClient, private store: Store) {
    this.webUrl = environment.webUrl;
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.webUrl}/user/authenticate`, { username, password }).pipe(
      map(user => {
        // login successful if there's a jwt token in the response
        if (user && user.token) {
          this.userToken = user.token;
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.store.dispatch(new GetLoggedInUser(user));
          // this.getUserImage(user.id)
          //   .subscribe(img => {
          //   });
        }

        return user;
      })
    );
  }

  getAll() {
    return this.http.get<Users[]>(`${this.webUrl}/user`);
  }

  getById(id: any) {
    return this.http.get<Users>(`${this.webUrl}/user/${id}`);
  }

  getByEmail(email: any) {
    return this.http.get<Users>(`${this.webUrl}/user/email/${email}`);
  }

  register(user: any) {
    return this.http.post(`${this.webUrl}/user/register`, user);
  }

  update(user) {
    return this.http.put(`${this.webUrl}/user/${user.userId}`, user);
  }
  updateUserStatus(user: any) {
    return this.http.patch(`${this.webUrl}/user/status/${user.id}`, user);
  }
  delete(id: any) {
    return this.http.delete(`${this.webUrl}/user/${id}`);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.clear();
    // this.store.dispatch(
    //   new StateClear()
    // );
  }
  decode() {
    try {
      return jwt_decode(this.userToken);
    } catch (Error) {
      return null;
    }
  }

  getUserImage(id: string) {
    return this.http.get(`${this.webUrl}/user/image/${id}`);
  }
  uploadUserImage(image: any) {
    return this.http.post(`${this.webUrl}/user/image`, image);
  }
  updateUserImage(id: any, image: any) {
    return this.http.put(`${this.webUrl}/user/image/${id}`, image);
  }

  sendEmail(payload) {
    return this.http.post<Users>(`${this.webUrl}/sendmail`, payload);
  }
}
