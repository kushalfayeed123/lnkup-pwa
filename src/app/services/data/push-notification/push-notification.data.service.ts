import { Injectable } from '@angular/core';


@Injectable()

export abstract class PushNotificationDataService {
  abstract saveSubscription(sub);
  abstract sendFCMMessage(payload);
  abstract updateFCMToken(id, token);
  abstract getUserToken(id);
}
