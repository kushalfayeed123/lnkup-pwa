import { Injectable } from '@angular/core';
import { PushNotificationDataService } from './push-notification.data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })

export class PushNotificationWebService implements PushNotificationDataService {
  webUrl: any;
  constructor(private http: HttpClient) {
    this.webUrl = environment.webUrl;
  }

  saveSubscription(sub: any) {
    let header = new HttpHeaders();
    header = header.append('content-type', 'application/json');
    return this.http.post(`${this.webUrl}/notification`, sub );
  }
  sendFCMMessage(payload: any) {
    return this.http.post(`${this.webUrl}/notification/send`, payload);
  }

  updateFCMToken(id: string, token: string) {
    let header = new HttpHeaders();
    header = header.append('content-type', 'application/json');
    return this.http.put(`${this.webUrl}/notification/${id}`, token);
  }

  getUserToken(id: string) {
    return this.http.get(`${this.webUrl}/notification/${id}`);
  }

}
