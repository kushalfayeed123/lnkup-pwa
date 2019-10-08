import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { ActiveTripDataService } from '../data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()

export class NotificationsService {
    user: any;
    webUrl: string;
    activeTripId: any;

    private _successAlert = new BehaviorSubject(null);
    public successAlert = this._successAlert.asObservable();

    private _declineAlert = new BehaviorSubject(null);
    public declineAlert = new BehaviorSubject(null);



    constructor(private router: Router) {
        this.webUrl = environment.openConnect;
        this.user = JSON.parse(localStorage.getItem('currentUser'));
    }

    intiateConnection() {
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.webUrl}?token=${this.user.token}`)
            .configureLogging(signalR.LogLevel.Information)
            .build();

        hubConnection.on('ReceiveMessage', message => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const userRole = user.role;
            if (userRole === 'Driver') {
                this.alertDriverSuccess();
            } else  {
                this.alertRiderSuccess();
            }
            alert(message);

        });

        hubConnection.on('ReceiveDeclineMessage', message => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const userRole = user.role;
            if (userRole === 'Driver') {
                this.alertDriverCancel();
            } else  {
                this.alertRiderDecline();
            }
            alert(message);

        });

        hubConnection.start().catch(err => console.error(err.toString()))
        .then(() => {
            hubConnection.invoke('GetConnectionId')
            .then((connectionId) => {
              sessionStorage.setItem('clientConnectionId', connectionId);
            //   hubConnection.invoke('ReceiveMessage', `Welcome back ${this.user.userName}`);
              console.log('connection Id', connectionId);
            });
        });
    }
    alertDriverSuccess() {
        const alertDriver = true;
        this._successAlert.next(alertDriver);
    }

    alertRiderSuccess() {
        const alertRider = true;
        this._successAlert.next(alertRider);
    }


    alertDriverCancel() {
        const alertDriver = true;
        this._declineAlert.next(alertDriver);
    }

    alertRiderDecline() {
        const alertRider = false;
        this._declineAlert.next(alertRider);
    }


}
