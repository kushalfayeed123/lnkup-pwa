import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActiveTripWebService } from 'src/app/services/data/active-trip/active-trip.web.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveRiders } from 'src/app/models/ActiveRider';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';

@Component({
  selector: 'app-rider-request',
  templateUrl: './rider-request.component.html',
  styleUrls: ['./rider-request.component.scss']
})
export class RiderRequestComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  public config: any = {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    spaceBetween: 30
};
  activeTripId: string;
  activeTrip: ActiveTrips;
  riderRequest: ActiveRiders[];
  feePerSeat: number;
  allowedRiderCount: number;

  constructor(private tripService: ActiveTripDataService,
              private notifyService: NotificationsService,
              private riderService: ActiveRiderDataService) {
    this.getDriverSuccessAlert();
  }

  ngOnInit() {
    this.getActiveTrips();

  }

  async getDriverSuccessAlert() {
    await this.notifyService.successAlert
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(alert => {
      if (alert === true) {
        this.getActiveTrips();
      }
    });
  }

  async getDriverCancelAlert() {
    await this.notifyService.declineAlert
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(alert => {
      if (alert === true) {
        this.getActiveTrips();
      }
    });
  }

  getActiveTrips() {
    const activeTrip = JSON.parse(localStorage.getItem('activeTrip'));
    this.activeTripId = activeTrip.tripId;
    this.getTripRequest(this.activeTripId);
  }

  getTripRequest(tripId) {
    this.tripService.getTripsById(tripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(activeTrip => {
      this.activeTrip = activeTrip;
      this.riderRequest = activeTrip.activeRiders;
      this.feePerSeat = activeTrip.aggregrateTripFee / activeTrip.maxRiderNumber;
      this.allowedRiderCount = activeTrip.allowedRiderCount;
      console.log('active trip', this.activeTrip);
    });
  }
  acceptTripRequest(rider) {
    console.log(rider);
    const tripConnectionId = sessionStorage.getItem('clientConnectionId');
    const driverName = this.activeTrip.tripDriver.driver.userName;
    const pickup = this.activeTrip.tripPickup;
    const riderId = rider.activeRiderId;
    const pickupTime = this.activeTrip.tripStartDateTime;
    const riderConnectionId = rider.riderConnectId;
    const message  = `Your request has been accepted, please lnkup with ${driverName}
    at ${pickup} on or before ${pickupTime}` ;
    const newAllowedRiderCount = this.allowedRiderCount + 1;

    const activeRider = {tripStatus: 2,
                        paymentStatus: 0,
                        riderConnectId: riderConnectionId};

    const activeTrip = {driverTripStatus: 1,
                        allowedRiderCount: newAllowedRiderCount,
                        tripConnectionId};

    this.riderService.update(riderId, activeRider)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.tripService.updateTrip(this.activeTripId, activeTrip)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        this.tripService.sendNotification(riderConnectionId, message)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(response => {
          console.log('message sent');
        }, error => {
          console.log(error);
        });
      }, error => {
        console.log(error);
      });
    }, error => {
      console.log(error);
    });
  }

  declineTripRequest(rider) {
    console.log(rider);
    const riderConnectionId = rider.riderConnectId;
    const riderId = rider.activeRiderId;
    const driverName = this.activeTrip.tripDriver.driver.userName;
    const message = `Sorry, ${driverName} declined your request. Do you want to LnkuP with another driver?`;
    this.riderService.delete(riderId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.tripService.sendDeclineNotification(riderConnectionId, message)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        this.getActiveTrips();
      }, error => {
        console.log('Network error');
      });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
