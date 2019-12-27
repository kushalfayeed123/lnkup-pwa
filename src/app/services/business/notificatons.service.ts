import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AngularFireMessaging } from '@angular/fire/messaging';
import * as firebase from 'firebase';
import { Users } from 'src/app/models/Users';
import { SwPush } from '@angular/service-worker';
import { BroadcastService } from './broadcastdata.service';
import { PushNotificationDataService } from '../data/push-notification/push-notification.data.service';

@Injectable()

export class NotificationsService {
    user: any;
    webUrl: string;
    activeTripId: any;



    private _successAlert = new BehaviorSubject(null);
    public successAlert = this._successAlert.asObservable();

    private _declineAlert = new BehaviorSubject(null);
    public declineAlert = new BehaviorSubject(null);
    reconnect: boolean;

    public currentMessage = new BehaviorSubject(null);
    message: Notification;
    receiver: Users;
    token: any;

    pushSubscription: { token: string; userId: any; };
    subscription: string;
    pushSubscriptionToUpdate: { token: string; };



    constructor(private router: Router, private toastService: ToastrService,
        private angularFireMessaging: AngularFireMessaging,
        private pushService: PushNotificationDataService,
        private authService: AuthenticateDataService,
        private swPush: SwPush,
        private broadCastService: BroadcastService
    ) {
        this.webUrl = environment.openConnect;
        this.angularFireMessenger();
    }


    angularFireMessenger() {
        this.angularFireMessaging.messaging
            .subscribe(messagingContext => {
                messagingContext.onMessage = messagingContext.onMessage.bind(messagingContext);
                messagingContext.onTokenRefresh = messagingContext.onTokenRefresh.bind(messagingContext);
            });

    }


  
    requestPermision() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const userId = user.id;
        this.angularFireMessaging.requestToken
            .subscribe(sub => {
                this.subscription = sub;
                this.pushSubscription = {
                    token: this.subscription,
                    userId
                };
            });
        this.pushService.getUserToken(userId)
            .subscribe(token => {
                this.token = token;
            });
        console.log('token', this.token);
        if (!this.token) {
            this.pushService.saveSubscription(this.pushSubscription)
                .subscribe(res => {
                }, error => {
                    console.error(error);
                });
        } else {
            this.pushSubscriptionToUpdate = {
                token: this.subscription
            };
            this.pushService.updateFCMToken(userId, this.pushSubscriptionToUpdate)
                .subscribe(res => {
                }, error => {
                    console.error(error);
                });
        }

    }
    sendNotification(userId, message) {
        this.authService.getById(userId)
            .toPromise()
            .then(res => {
                this.receiver = res;
                this.sendMessage(res, message);
                console.log('receiver', res);
            });
    }
    receiveMessage() {
        this.angularFireMessaging.messages
            .subscribe(message => {
                this.currentMessage.next(message);
            });
    }

    sendMessage(user, message) {
        const token = user.pushNotificationTokens[0].token;
        const pushMessage = {...message, token};
        this.pushService.sendFCMMessage(pushMessage)
            .subscribe(res => {
                console.log(res);
            });
    }


    deleteSubscription() {
        const token = localStorage.getItem('pushToken');
        this.angularFireMessaging.deleteToken(token)
            .subscribe(res => {
                console.log(res);
            });
    }

    sendAcceptMessage(user?, messages?) {
        this.user = JSON.parse(localStorage.getItem('currentUser'));
        const loginToken = this.user.token;
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.webUrl}`, { accessTokenFactory: () => loginToken })
            .configureLogging(signalR.LogLevel.Information)
            .build();
        hubConnection.start().catch(err => console.error(err.toString()))
            .then(() => {
                hubConnection.invoke('ReceiveMessage', user, messages)
                    .then((res) => {
                        console.log(user);
                    });
            });
    }

    rejectMessage(userId, message) {
        this.user = JSON.parse(localStorage.getItem('currentUser'));
        const loginToken = this.user.token;
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.webUrl}`, { accessTokenFactory: () => loginToken })
            .configureLogging(signalR.LogLevel.Information)
            .build();
        // const userId = this.user.id.toString;

        hubConnection.start().catch(err => console.error(err.toString()))
            .then(() => {
                hubConnection.invoke('ReceiveDeclineMessage', userId, message)
                    .then((res) => {
                        console.log(res);
                    });
            });
    }

    intiateConnection() {
        this.user = JSON.parse(localStorage.getItem('currentUser'));
        const loginToken = this.user.token;
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.webUrl}`, { accessTokenFactory: () => loginToken })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        hubConnection.on('ReceiveMessage', message => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const userRole = user.role;
            if (userRole === 'Driver') {
                this.alertDriverSuccess(message);
            } else {
                this.alertRiderSuccess(message);
            }
        });

        hubConnection.on('ReceiveDeclineMessage', message => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const userRole = user.role;
            if (userRole === 'Driver') {
                this.alertDriverCancel(message);
            } else {
                this.alertRiderDecline(message);
            }
        });

        hubConnection.start().catch(err => console.error(err.toString()))
            .then(() => {
                hubConnection.invoke('GetConnectionId')
                    .then((connectionId) => {
                        sessionStorage.setItem('clientConnectionId', connectionId);
                        //   hubConnection.invoke('ReceiveMessage', `Welcome back ${this.user.userName}`);
                    });
            });
        hubConnection.onclose(function () {
            setTimeout(() => {
                hubConnection.start();
            }, 5000);
        });
    }
    alertDriverSuccess(message) {
        const alertDriver = true;
        this.showInfoMessage(message);
        this._successAlert.next(alertDriver);
    }

    alertRiderSuccess(message) {
        const alertRider = true;
        this.showSuccessMessage(message);
        this._successAlert.next(alertRider);
    }

    alertDriverCancel(message) {
        const alertDriver = true;
        this.showErrorMessage(message);
        this._declineAlert.next(alertDriver);
    }

    alertRiderDecline(message) {
        const alertRider = true;
        this.showErrorMessage(message);
        this._declineAlert.next(alertRider);
    }

    showSuccessMessage(message) {
        this.broadCastService.publishMessage(message);
    }
    showErrorMessage(message) {
        this.broadCastService.publishMessage(message);
    }
    showInfoMessage(message) {
        this.broadCastService.publishMessage(message);
    }
    // pushNotification(message) {
    //     const title = 'Hello';
    //     const options = new PushNotificationOptions();
    //     options.body = message;

    //     this._pushNotificationService.create(title, options).subscribe((notif) => {
    //   if (notif.event.type === 'show') {
    //     console.log('onshow');
    //     setTimeout(() => {
    //       notif.notification.close();
    //     }, 3000);
    //   }
    //   if (notif.event.type === 'click') {
    //     console.log('click');
    //     notif.notification.close();
    //   }
    //   if (notif.event.type === 'close') {
    //     console.log('close');
    //   }
    // },
    // (err) => {
    //      console.log(err);
    // });
    // }

}
