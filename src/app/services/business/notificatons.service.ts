import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AngularFireMessaging } from '@angular/fire/messaging';
import * as firebase from 'firebase';
import { AuthenticateDataService } from '../data/authenticate.data.service';

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



    constructor(private router: Router, private toastService: ToastrService,
        private angularFireMessaging: AngularFireMessaging,
        private authenticateService: AuthenticateDataService
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
        this.angularFireMessaging.requestToken
            .subscribe(sub => {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                const userId = user.id;
                localStorage.setItem('pushToken', sub);
                const pushSubscription = {
                    token: sub,
                    userId
                };
                this.authenticateService.saveSubscription(pushSubscription)
                    .subscribe(res => {
                        console.log('saved notification sub', res);
                    });
            });
    }

    receiveMessage() {
        console.log('receive method called');
        this.angularFireMessaging.messages
            .subscribe(message => {
                console.log('message', message);
            });
    }

    sendMessage() {
        const message = {

        };
        this.authenticateService.sendFCMMessage(message)
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
        this._successAlert.next(alertDriver);
        this.showInfoMessage(message);
    }

    alertRiderSuccess(message) {
        const alertRider = true;
        this._successAlert.next(alertRider);
        this.showSuccessMessage(message);

    }

    alertDriverCancel(message) {
        const alertDriver = true;
        this._declineAlert.next(alertDriver);
        this.showErrorMessage(message);
    }

    alertRiderDecline(message) {
        const alertRider = true;
        this._declineAlert.next(alertRider);
        this.showErrorMessage(message);
    }

    showSuccessMessage(message) {
        this.toastService.success(message);
    }
    showErrorMessage(message) {
        this.toastService.error(message);
    }
    showInfoMessage(message) {
        this.toastService.info(message);
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
