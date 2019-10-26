import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActiveTripWebService } from 'src/app/services/data/active-trip/active-trip.web.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveRiders } from 'src/app/models/ActiveRider';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { Router } from '@angular/router';

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
  activeTrip: any;
  riderRequest: ActiveRiders[];
  feePerSeat: number;
  allowedRiderCount: number;
  actriveTripStatus: number;
  activeTripStatus: number;
  maxSeat: number;
  riderRequestLength: number;

  constructor(private tripService: ActiveTripDataService,
              private notifyService: NotificationsService,
              private riderService: ActiveRiderDataService,
              private router: Router) {
    this.getDriverSuccessAlert();
  }

  ngOnInit() {
    this.getActiveTrips();
    // this.notifyService.intiateConnection();

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
      this.riderRequest = activeTrip.activeRiders.filter(x => x.tripStatus === '1');
      this.riderRequestLength = this.riderRequest.length;
      this.feePerSeat = activeTrip.aggregrateTripFee / activeTrip.maxRiderNumber;
      const allowedRiderCount = activeTrip.allowedRiderCount;
      this.maxSeat = activeTrip.maxRiderNumber;
      if (allowedRiderCount === 0) {
        this.allowedRiderCount = this.maxSeat;
      } else {
        this.allowedRiderCount = allowedRiderCount;
      }
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
    const bookedSeat = rider.bookedSeat;
    const riderConnectionId = rider.riderConnectId;
    const message  = `Your request has been accepted, please lnkup with ${driverName}
    at ${pickup} on or before ${pickupTime}` ;
    const newAllowedRiderCount = this.allowedRiderCount - bookedSeat;
    if (newAllowedRiderCount === 0) {
      this.activeTripStatus = 0;
    } else {
      this.activeTripStatus = 1;
    }
    const activeRider = {tripStatus: '2',
                        paymentStatus: '0',
                        riderConnectId: riderConnectionId};

    const activeTrip = {driverTripStatus: this.activeTripStatus,
                        allowedRiderCount: newAllowedRiderCount,
                        tripConnectionId};


    this.riderService.update(riderId, activeRider)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      console.log(data);
      this.tripService.updateTrip(this.activeTripId, activeTrip)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        this.getActiveTrips();
        // this.notifyService.sendAcceptMessage(riderId, message);
      }, error => {
        console.log(error);
      });
    }, error => {
      console.log(error);
    });

    if (this.activeTripStatus === 0) {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      const userId = user.id;
      this.router.navigate([`/driver/home/${userId}`], { queryParams: { driverNav: true }});
    }
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
