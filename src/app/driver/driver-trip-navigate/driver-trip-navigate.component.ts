import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveRiders } from 'src/app/models/ActiveRider';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/business/notificatons.service';

@Component({
  selector: 'app-driver-trip-navigate',
  templateUrl: './driver-trip-navigate.component.html',
  styleUrls: ['./driver-trip-navigate.component.scss']
})
export class DriverTripNavigateComponent implements OnInit, OnDestroy {
  public config: any = {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    spaceBetween: 10
};
  activeTripId: string;
  private unsubscribe$ = new Subject<void>();
  activeTrip: ActiveTrips;
  tripRiders: ActiveRiders[];
  startTrip: boolean;
  endTrip: boolean;
  name: any;
  animal: any;
  userId: any;



  constructor(private tripService: ActiveTripDataService,
              private broadCastService: BroadcastService,
              public dialog: MatDialog,
              private router: Router,
              private notifyService: NotificationsService) { }

  ngOnInit() {
    this.getUser();
    this.getActiveTrip();
  }
  getUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user.id;
  }
  getActiveTrip() {
    const activeTrip = JSON.parse(localStorage.getItem('activeTrip'));
    this.activeTripId = activeTrip.tripId;
    this.getTripRequest(this.activeTripId);
  }

  getTripRequest(tripId) {
    this.tripService.getTripsById(tripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(activeTrip => {
      this.activeTrip = activeTrip;
      this.tripRiders = activeTrip.activeRiders.filter(x => x.tripStatus === '2');
      console.log('active trip', this.activeTrip);
    });
  }
  startActiveTrip() {
    this.startTrip = true;
    this.endTrip = true;
    this.broadCastService.publishStartTrip(this.startTrip);
  }

  endActiveTrip() {
  
    const tripFee = this.activeTrip.aggregrateTripFee;
    const newTripFee = (20 / 100) * tripFee;
    const driverFee = tripFee - newTripFee;
    this.name = 'Your balance for this trip is';
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '90%',
      panelClass: 'dialog',
      data: {name: this.name, price: driverFee}
    });
    this.updatetripStatus();
    dialogRef.afterClosed().subscribe(result => {
      this.endTrip = false;
      localStorage.removeItem('activeTrip');
      localStorage.removeItem('origin');
      localStorage.removeItem('destination');
      this.sendTripEndMessage();
      this.router.navigate(['driver/home', this.userId]);
    });
  }
  sendTripEndMessage() {
    this.tripRiders.forEach(element => {
      const recieverId = element.userId;
      const message = `Your trip has ended, your fee is ₦${element.tripFee}.`;
      this.notifyService.sendAcceptMessage(recieverId, message);
      this.notifyService.sendNotification(recieverId, message);
    });
  }

  updatetripStatus() {
    const tripConnectionId = sessionStorage.getItem('clientConnectionId');
    const activeTrip = {
      driverTripStatus: 0,
      allowedRiderCount: 0,
      tripConnectionId
    };
    this.tripService.updateTrip(this.activeTripId, activeTrip)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(response => {
    }, error => {
      console.log(error);
      this.updatetripStatus();
    });
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
