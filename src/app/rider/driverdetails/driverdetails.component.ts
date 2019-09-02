import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-driverdetails',
  templateUrl: './driverdetails.component.html',
  styleUrls: ['./driverdetails.component.scss']
})
export class DriverdetailsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  isTrips: boolean;
  availableSeats: number;
  driverName: any;
  destination: any;


  constructor(private mapService: MapBroadcastService,
              private activeTripService: ActiveTripDataService,
              private router: Router) { }

  ngOnInit() {
    this.getTripId();
  }

  getTripId() {
    this.mapService.tripId
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      const tripId = data;
      this.activeTripService.getTripsById(tripId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(trip => {
        const max = trip.maxRiderNumber;
        const allowed = trip.allowedRiderCount;
        const availableSeats = max - allowed;
        const destinationLng = trip.driverEndLongitude;
        const destinationLat = trip.driverEndLatitude;
        this.mapService.findAddressByCoordinates(destinationLat, destinationLng);
        setTimeout(() => {
          this.destination = localStorage.getItem('dropOff');
          console.log('dropOff', this.destination);
        }, 1000);
        this.availableSeats = availableSeats;
        this.driverName = trip.tripDriver.driver.userName;
        this.isTrips = true;
      });

    });
  }

  navigateToBookSeat() {
    this.router.navigate(['bookSeat']);
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
