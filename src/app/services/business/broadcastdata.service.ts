import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BroadcastService {
    private _userData = new BehaviorSubject(null);
    public userData = this._userData.asObservable();

    constructor() {

    }

    shareCurrentUser(user) {
        this._userData.next(user);
        console.log('data gets to service', user);
    }
}