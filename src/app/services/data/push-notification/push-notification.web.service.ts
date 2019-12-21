import { Injectable } from '@angular/core';
import { PushNotificationDataService } from './push-notification.data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })

export class PushNotificationWebService implements PushNotificationDataService {
  webUrl: any;
  // tslint:disable-next-line: max-line-length
  serverKey = 'AAAAewF-LrQ:APA91bFMHtngh62GqRlXRi8imAR5OimFkG10_whc1vGoGs5i-n6yi8cWbP2quHECvLBEkkrIsy8oitwnoocsNFwXsMoEZfDv1gm6GMGzemLSrm28anbmlhiHHNkzeTzAfzMKWFUc4tRE';


  constructor(private http: HttpClient) {
    this.webUrl = environment.webUrl;
  }

  saveSubscription(sub: any) {
    return this.http.post(`${this.webUrl}/subscribe`, sub);
  }
  sendFCMMessage(payload: any) {
    return this.http.post(`${this.webUrl}/subscribe/Send`, payload);
  }

}
