import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActiveTripWebService } from 'src/app/services/data/active-trip/active-trip.web.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-rider-request',
  templateUrl: './rider-request.component.html',
  styleUrls: ['./rider-request.component.scss']
})
export class RiderRequestComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  activeTripId: string;

  constructor(private tripService: ActiveTripWebService) { }

  ngOnInit() {

    this.getActiveTrips();
  }

  getActiveTrips() {
    const activeTrip = JSON.parse(localStorage.getItem('activeTrip'));
    this.activeTripId = activeTrip.tripId;
  }

  acceptTripRequest() {
    this.tripService.getTripsById(this.activeTripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(activeTrip => {
      const currentTrip = activeTrip;
      console.log('active trip', currentTrip);
    });
  }

  declineTripRequest() {

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
