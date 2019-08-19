import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss']
})
export class PushNotificationComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = 'BCleJ0xgtXBcFHep4RmZXWX3Fa6S6ofO-XCzK56AHW3CXPlXZBsOtQ1ydmoidDBXaPeZdvA70ybSXB6atJBq7Jc';

  constructor(private swPush: SwPush,
            ) { }

  ngOnInit() {
  }

  subscribeToNotifications() {

    this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    // .then(sub => this.newsletterService.addPushSubscriber(sub).subscribe())
    .catch(err => console.error('Could not subscribe to notifications', err));
}

}
