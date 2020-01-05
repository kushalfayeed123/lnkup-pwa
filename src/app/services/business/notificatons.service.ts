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
import { PushNotificationTokens } from 'src/app/models/pushNotificationTokens';
import { ActiveTripDataService } from '../data/active-trip/active-trip.data.service';

@Injectable()

export class NotificationsService {
    user: any;
    webUrl: string;
    activeTripId: any;



    private _successAlert = new BehaviorSubject(null);
    public successAlert = this._successAlert.asObservable();

    private _declineAlert = new BehaviorSubject(null);
    public declineAlert = this._declineAlert.asObservable();

    private _endTrip = new BehaviorSubject(null);
    public endTrip = this._endTrip.asObservable();
    reconnect: boolean;

    public currentMessage = new BehaviorSubject(null);
    message: Notification;
    receiver: Users;
    token: PushNotificationTokens[];

    pushSubscription: { token: string; userId: any; };
    subscription: string;
    pushSubscriptionToUpdate: { token: string; };
    userId: any;



    constructor(private router: Router, private toastService: ToastrService,
                private angularFireMessaging: AngularFireMessaging,
                private pushService: PushNotificationDataService,
                private authService: AuthenticateDataService,
                private broadCastService: BroadcastService,
                private tripService: ActiveTripDataService
    ) {
        this.webUrl = environment.openConnect;
    }


    angularFireMessenger() {
        this.angularFireMessaging.messaging
            .subscribe(messagingContext => {
                messagingContext.onMessage = messagingContext.onMessage.bind(messagingContext);
                messagingContext.onTokenRefresh = messagingContext.onTokenRefresh.bind(messagingContext);
            });
        const user = JSON.parse(localStorage.getItem('currentUser'));
        this.userId = user.id;
    }

    getuserToken(sub) {
        this.authService.getById(this.userId)
            .subscribe(token => {
                this.token = token.pushNotificationTokens;
                if (this.token.length > 0) {
                    this.updateToken(this.userId, sub);
                } else {
                    this.saveToken(this.userId, sub);
                }
            });
    }

    updateToken(userId, sub) {
        this.pushSubscriptionToUpdate = {
            token: sub
        };
        this.pushService.updateFCMToken(userId, this.pushSubscriptionToUpdate)
            .subscribe(res => {
            }, error => {
                console.error(error);
            });
    }
    saveToken(userId, sub) {
        this.pushSubscription = {
            token: sub,
            userId
        };
        this.pushService.saveSubscription(this.pushSubscription)
            .subscribe(res => {
            }, error => {
                console.error(error);
            });
    }

    requestPermision() {
        this.angularFireMessaging.requestToken
            .subscribe(sub => {
                this.subscription = sub;
                this.getuserToken(sub);
            });
    }

    tokenRefresh() {
        this.angularFireMessaging.tokenChanges
            .subscribe(sub => {
                if (sub) {
                    this.updateToken(this.userId, sub);
                } else {
                    return;
                }
            });
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
        const pushMessage = { ...message, token };
        this.pushService.sendFCMMessage(pushMessage)
            .subscribe(res => {
                console.log(res);
            });
    }


    deleteSubscription() {
        this.angularFireMessaging.deleteToken(this.token[0].token)
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
        const trip = JSON.parse(localStorage.getItem('riderRequest'));
        this.showSuccessMessage(message);
        this._successAlert.next(alertRider);
        console.log(trip);
        if (trip) {
            const tripId = trip.tripId;
            this.tripService.getTripsById(tripId)
            .subscribe(res => {
                if (res.driverTripStatus === 0) {
                    const endTrip = true;
                    this._endTrip.next(endTrip);
                } else {
                    return;
                }
            });
        }
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
