import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { Subject } from 'rxjs';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';

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
  tripPricePerRider: any;
  end: any;
  tripId: any;


  constructor(private mapService: MapBroadcastService,
              private activeTripService: ActiveTripDataService,
              private broadcastService: BroadcastService,
              private router: Router) { }

  ngOnInit() {
    this.getTripId();
  }

  getTripId() {
    this.mapService.tripId
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.tripId = data;
      this.activeTripService.getTripsById(this.tripId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(trip => {
        const max = trip.maxRiderNumber;
        const allowed = trip.allowedRiderCount;
        const availableSeats = max - allowed;
        const destinationLng = trip.driverEndLongitude;
        const destinationLat = trip.driverEndLatitude;
        const pickup = trip.tripPickup;
        this.mapService.findLocation(pickup);
        const pickupCoordinates = JSON.parse(localStorage.getItem('pickup'));
        this.mapService.findAddressByCoordinates(destinationLat, destinationLng);
        setTimeout(() => {
          this.destination = localStorage.getItem('dropOff');
          console.log('dropOff', this.destination);
        }, 1000);
        this.availableSeats = availableSeats;
        this.driverName = trip.tripDriver.driver.userName;
        this.tripPricePerRider = trip.tripPricePerRider;
        this.isTrips = true;
        pickupCoordinates.forEach(location => {
          const tripDestination = new google.maps.LatLng(destinationLat, destinationLng);
          const pickupLocation = new google.maps.LatLng(location.lat, location.lng);
          const tripDistance = (google.maps.geometry.spherical.computeDistanceBetween(pickupLocation, tripDestination)) / 1000;
          const pricePerKilometer = 150;
          const pricePerSeat = pricePerKilometer / max;
          this.tripPricePerRider = Math.round(pricePerSeat * tripDistance);
          const riderRequest = {tripId: this.tripId,
                                tripFee: this.tripPricePerRider};
          localStorage.setItem('riderRequest', JSON.stringify(riderRequest));
        });
      });

    });
  }
  getAllAvailableTrips() {
    this.broadcastService.toggleAvailableTrips(false);
    console.log('click');
  }

  navigateToBookSeat() {
    this.router.navigate(['rider/bookSeat']);
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
