import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BroadcastService {
    private _userData = new BehaviorSubject(null);
    public userData = this._userData.asObservable();

    private _riderRequest = new BehaviorSubject(null);
    public riderRequest = this._riderRequest.asObservable();
    
    private _showTripDetails = new BehaviorSubject(null);
    public showTripDetails = this._riderRequest.asObservable();

    private _showSideNav = new BehaviorSubject(null);
    public showSideNav = this._showSideNav.asObservable();

    private _startTrip = new BehaviorSubject(null);
    public startTrip = this._startTrip.asObservable();



    constructor() {

    }

    shareCurrentUser(user) {
        this._userData.next(user);
        console.log('data gets to service', user);
    }

    publishRiderRequest(request) {
        this._riderRequest.next(request);
    }

    toggleAvailableTrips(showTripDetails) {
        this._showTripDetails.next(showTripDetails);
    }

    publishSideNavValue(showSideNav) {
        this._showSideNav.next(showSideNav);
    }
    publishStartTrip(startTrip) {
        this._startTrip.next(startTrip);
    }
}
