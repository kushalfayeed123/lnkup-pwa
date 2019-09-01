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


  constructor(private mapService: MapBroadcastService,
              private activeTripService: ActiveTripDataService) { }

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
        this.isTrips = true;
        const max = trip.maxRiderCount;
        const allowed = trip.allowedRiderCount;
        const availableSeats = max - allowed;
        console.log(availableSeats);
        this.availableSeats = availableSeats;
      });

    });
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
