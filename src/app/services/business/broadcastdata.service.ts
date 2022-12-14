import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ActiveTripDataService } from "../data/active-trip/active-trip.data.service";

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

  private _driverImage = new BehaviorSubject(null);
  public driverImage = this._driverImage.asObservable();

  private _paymentStatus = new BehaviorSubject(null);
  public paymentStatus = this._paymentStatus.asObservable();

  private _notifMessage = new BehaviorSubject(null);
  public notifMessage = this._notifMessage.asObservable();

  private _allTrips = new BehaviorSubject(null);
  public allTrips = this._allTrips.asObservable();

  private _emptyTrips = new BehaviorSubject(null);
  public emptyTrips = this._emptyTrips.asObservable();

  private _recovery = new BehaviorSubject(null);
  public recovery = this._recovery.asObservable();

  private _messageType = new BehaviorSubject(null);
  public messageType = this._messageType.asObservable();

  private _modalStat = new BehaviorSubject(null);
  public modalStat = this._modalStat.asObservable();


  constructor(private activeTrip: ActiveTripDataService) {}

  shareCurrentUser(user) {
    this._userData.next(user);
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
  publishDriverImage(driverImage) {
    this._driverImage.next(driverImage);
  }

  publishUserPaymentStatus(paymentStatus) {
    this._paymentStatus.next(paymentStatus);
  }

  publishMessage(message, type) {
    this._notifMessage.next(message);
    this._messageType.next(type);
  }
  publishRecoveryStatus(status) {
    this._recovery.next(status);
  }
  publishAllTrips(allTrips) {
    this._allTrips.next(allTrips);
  }

  publishEmptyTrips(trips) {
    this._emptyTrips.next(trips);
  }

  publishModalStatus(status) {
    this._modalStat.next(status);
  }
  
  getAllTrips() {
    this.activeTrip
      .getAllTrips()
      .subscribe(data => {
        if (!data) {
          return;
        } else {
          this.publishAllTrips(data);
        }
      });
  }

}
