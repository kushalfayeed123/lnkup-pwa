
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, config } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticateDataService } from './authenticate.data.service';
import { Users } from 'src/app/models/Users';
import * as jwt_decode from 'jwt-decode';
import { environment } from '../../../environments/environment';




@Injectable({ providedIn: 'root' })
export class AuthenticateWebService implements AuthenticateDataService {
 
  public webUrl: string;
  private currentUserSubject: BehaviorSubject<Users>;
  public currentUser: Observable<Users>;
  public registerUrl: string;
  private loggedIn = new BehaviorSubject<boolean>(false);
  mockUrl: string;

  constructor( private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<Users>(
      JSON.parse(localStorage.getItem('currentUser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.webUrl = environment.webUrl;

  }

  public get currentUserValue(): Users {
    return this.currentUserSubject.value;
  }
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.webUrl}/user/authenticate`, { username, password }).pipe(
      map(user => {
        // login successful if there's a jwt token in the response
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.loggedIn.next(true);
          this.currentUserSubject.next(user);
          this.getUserImage(user.id)
          .subscribe(img => {
          });
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

  register(user: any) {
    return this.http.post(`${this.webUrl}/user/register`, user);
  }
  saveSubscription(sub: any) {
    return this.http.post(`${this.webUrl}/subscribe`, sub);
  }
  sendFCMMessage(payload: any) {
    return this.http.post(`${this.webUrl}/subscribe/send`, payload);
  }
  update(user: any) {
    console.log('from the service', user);
    return this.http.put(`${this.webUrl}/user/${user.id}`, user);
  }
  updateUserStatus(user: any) {
    console.log('from the service', user);
    return this.http.patch(`${this.webUrl}/user/status/${user.id}`, user);
  }
  delete(id: any) {
    return this.http.delete(`${this.webUrl}/user/${id}`);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.clear();
    this.currentUserSubject.next(null);
  }
  decode() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const token = currentUser.token;
    try {
      return jwt_decode(token);
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
}
