import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';

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

        hubConnection
            .start()
            .then(() => hubConnection.invoke('ReceiveMessage', `Welcome back ${this.user.userName}`))
            .catch(() => console.log('Error while establishing connection :( '));


    }
}
