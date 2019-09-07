import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BroadcastService {
    private _userData = new BehaviorSubject(null);
    public userData = this._userData.asObservable();
    private _riderFee = new BehaviorSubject(null);
    public riderFee = this._riderFee.asObservable();

    constructor() {

    }

    shareCurrentUser(user) {
        this._userData.next(user);
        console.log('data gets to service', user);
    }

    publishRiderTripFee(fee) {
        this._riderFee.next(fee);
    }
}