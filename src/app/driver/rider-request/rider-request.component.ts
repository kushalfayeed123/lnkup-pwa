import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActiveTripWebService } from 'src/app/services/data/active-trip/active-trip.web.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveRiders } from 'src/app/models/ActiveRider';

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

  constructor(private tripService: ActiveTripWebService) { }

  ngOnInit() {
    this.getActiveTrips();
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
      console.log('active trip', this.activeTrip);
    });
  }
  acceptTripRequest(riderId) {
    console.log(riderId)
  }

  declineTripRequest() {

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
