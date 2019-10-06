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

    private _alert = new BehaviorSubject(null);
    public alert = this._alert.asObservable();



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
            alert(message);
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const userRole = user.role;
            if (userRole === 'Driver') {
                this.alertDriver();
            } else  {
                this.alertRider();
            }
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
    alertDriver() {
        const alertDriver = true;
        this._alert.next(alertDriver);
    }

    alertRider() {
        const alertRider = true;
        this._alert.next(alertRider);
    }

}
