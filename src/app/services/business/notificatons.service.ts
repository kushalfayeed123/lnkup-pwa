import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { ConnectionPositionPair } from '@angular/cdk/overlay';

@Injectable()

export class NotificationsService {
    user: any;
    webUrl: string;



    constructor() {
        this.webUrl = environment.openConnect;
        this.user = JSON.parse(localStorage.getItem('currentUser'));
        this.intiateConnection();
    }

    intiateConnection() {
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.webUrl}?token=${this.user.token}`)
            .configureLogging(signalR.LogLevel.Information)
            .build();

        hubConnection.on('ReceiveMessage', message => {
            alert(message);
        });

        // hubConnection
        //     .start()
        //     .then(() => {hubConnection.invoke('GetConnectionId');
        //      })
        //     .catch(() => console.log('Error while establishing connection :( '));

        // hubConnection
        // .invoke('GetConnectionId')
        //     .then(connectId => {
        //         const connectionId = connectId;
        //         localStorage.setItem('connectionId', connectionId);
        //     });

        hubConnection.start().catch(err => console.error(err.toString()))
        .then(() => {
            hubConnection.invoke('GetConnectionId')
            .then((connectionId) => {
              console.log('connection Id', connectionId);
            });
        });
    }
}
