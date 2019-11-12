import { Component, OnInit } from '@angular/core';
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
export class DriverTripNavigateComponent implements OnInit {
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
    this.name = 'Your fare for this trip';
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '90%',
      panelClass: 'dialog',
      data: { price: this.activeTrip.aggregrateTripFee}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.endTrip = false;
      this.sendTripEndMessage();
      this.router.navigate(['driver/home', this.userId]);
    });
  }
  sendTripEndMessage() {
    this.tripRiders.forEach(element => {
      const recieverId = element.userId;
      const message = `Your trip has ended, please pay ${element.tripFee} to your driver`;
      this.notifyService.sendAcceptMessage(recieverId, message);
    });
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
