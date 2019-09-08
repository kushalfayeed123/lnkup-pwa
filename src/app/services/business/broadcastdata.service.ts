import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BroadcastService {
    private _userData = new BehaviorSubject(null);
    public userData = this._userData.asObservable();
    private _riderRequest = new BehaviorSubject(null);
    public riderRequest = this._riderRequest.asObservable();

    constructor() {

    }

    shareCurrentUser(user) {
        this._userData.next(user);
        console.log('data gets to service', user);
    }

    publishRiderRequest(request) {
        this._riderRequest.next(request);
    }
}