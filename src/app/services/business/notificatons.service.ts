import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { ActiveTripDataService } from '../data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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



    constructor(private router: Router, private toastService: ToastrService) {
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
                this.alertDriverSuccess(message);
            } else  {
                this.alertRiderSuccess(message);
            }
        });

        hubConnection.on('ReceiveDeclineMessage', message => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const userRole = user.role;
            if (userRole === 'Driver') {
                this.alertDriverCancel(message);
            } else  {
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
        hubConnection.onclose(function() {
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
        this.showErrorMessage(message);
        const alertRider = false;
        this._declineAlert.next(alertRider);
    }
    
    showSuccessMessage(message) {
        this.toastService.success(message, 'Success!');
    }
    showErrorMessage(message) {
        this.toastService.error(message, 'Sorry!');
    }
    showInfoMessage(message) {
        this.toastService.info(message, 'Success!');
    }

}
