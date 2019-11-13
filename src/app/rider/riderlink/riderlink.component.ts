import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapBroadcastService } from '../../services/business/mapbroadcast.service';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { Router } from '@angular/router';
import { DriverDataDataService } from 'src/app/services/data/driver-data/driver-data.data.service';
import { DriverData } from 'src/app/models/DriverData';

@Component({
  selector: 'app-riderlink',
  templateUrl: './riderlink.component.html',
  styleUrls: ['./riderlink.component.scss']
})
export class RiderlinkComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  riderRequestData: any;
  pickupAddress: string;
  driverName: any;
  userId: any;
  driverId: any;
  driverData: DriverData;
  driverImage: string;

  constructor(private driverDataService: DriverDataDataService,
              private riderService: ActiveRiderDataService,
              private tripService: ActiveTripDataService,
              private router: Router) { }

  ngOnInit() {
    this.getRiderRequest();
  }



  getRiderRequest() {
    this.riderRequestData = JSON.parse(localStorage.getItem('riderRequest'));
    const trip = JSON.parse(localStorage.getItem('tripDetails'));
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user.id;
    this.pickupAddress = trip.tripPickup;
    const driverId = trip.driverId;
    this.getDriverData(driverId);
  }

  getDriverData(driverId) {
    this.driverDataService.getDriverByDriverId(driverId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.driverData = res;
      this.driverImage = res.driver.userImage.image;
      console.log('driverData', this.driverData);
    });
  }

  confirmCancelRequest() {
    if (confirm('You will be charged N400 if you cancel, continue?')) {
      this.cancelRequest();
    }
  }
  cancelRequest() {
    const trip = JSON.parse(localStorage.getItem('tripDetails'));
    const activerRiderId = trip.activeRiders[0].activeRiderId;
    const tripConnectionId = trip.tripConnectionId;
    const riderName = trip.activeRiders[0].user.userName;
    const message = `Sorry, ${riderName} has just canceled this trip.`;
    this.riderService.delete(activerRiderId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.tripService.sendDeclineNotification(tripConnectionId, message)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        const alertMessage = 'Your trip request has been canceled.';
        alert(alertMessage);
        this.router.navigate(['/rider/home', this.userId]);
      });
    });
  }



  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
