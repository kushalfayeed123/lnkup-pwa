import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { Subject, Observable } from 'rxjs';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { Select } from '@ngxs/store';
import { TripsState } from 'src/app/state/trip/trips.state';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { SubSink } from 'subsink/dist/subsink';

@Component({
  selector: 'app-driverdetails',
  templateUrl: './driverdetails.component.html',
  styleUrls: ['./driverdetails.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class DriverdetailsComponent implements OnInit, OnDestroy {
  @Select(TripsState.getSelectedTrip) trips$: Observable<ActiveTrips>;

  private unsubscribe$ = new Subject<void>();
  private subs = new SubSink();
  isTrips: boolean;
  availableSeats: number;
  driverName: any;
  destination: any;
  tripPricePerRider: any;
  end: any;
  tripId: any;
  image: any;
  userId: any;
  tripStartTime: string;
  showNavBtn: boolean;
  trip: ActiveTrips;


  constructor(private mapService: MapBroadcastService,
    private activeTripService: ActiveTripDataService,
    private broadcastService: BroadcastService,
    private notificationService: NotificationsService,
    private router: Router) { }

  ngOnInit() {
    this.subs.add(
      this.trips$.subscribe(res => {
        this.trip = res;
        this.getTripId(res);
      })
    );
  }

  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user.id;
  }

  getTripId(trip) {

    this.image = trip.tripDriver.driver.imageUrl;
    this.broadcastService.publishDriverImage(trip);
    this.broadcastService.toggleAvailableTrips(trip);
    const max = trip.maxRiderNumber;
    const allowed = trip.allowedRiderCount;
    const driverId = trip.tripDriver.driverId;
    const driverUserId = trip.tripDriver.driver.userId;
    const driverEmail = trip.tripDriver.driver.email;
    const tripPickup = trip.tripPickup;
    const activeRiders = trip.activeRiders;
    const plateNumber = trip.tripDriver.carDocument2;
    const driverAccountId = trip.tripDriver.paymentAccountId;
    const tripDetails = {
      allowedRiderCount: allowed, maxRiderNumber: max, driverId,
      driverEmail, tripPickup, driverUserId, plateNumber, driverAccountId
    };
    localStorage.setItem('tripDetails', JSON.stringify(tripDetails));
    if (allowed === 0) {
      this.availableSeats = max;
    } else {
      this.availableSeats = allowed;
    }
    const destinationLng = Number(trip.driverEndLongitude);
    const destinationLat = Number(trip.driverEndLatitude);
    const pickup = trip.tripPickup;
    this.mapService.findLocation(pickup);
    const pickupCoordinates = JSON.parse(localStorage.getItem('pickup'));
    this.mapService.findAddressByCoordinates(destinationLat, destinationLng);
    setTimeout(() => {
      this.destination = localStorage.getItem('storedAddress');
    }, 1000);
    this.driverName = trip.tripDriver.driver.userName;
    this.tripPricePerRider = trip.tripPricePerRider;
    this.tripStartTime = trip.tripStartDateTime;

    const tripDestination = new google.maps.LatLng(destinationLat, destinationLng);
    const pickupLocation = new google.maps.LatLng(pickupCoordinates.lat, pickupCoordinates.lng);
    // tslint:disable-next-line: max-line-length
    new google.maps.DistanceMatrixService().getDistanceMatrix({
      origins: [pickupLocation], destinations: [tripDestination],
      travelMode: google.maps.TravelMode.DRIVING
    }, (results: any) => {
      const tripDistance = (results.rows[0].elements[0].distance.value / 1000);
      const pricePerKilometer = 37;
      this.tripPricePerRider = Math.round(pricePerKilometer * tripDistance);
      const tripConnectionId = trip.tripConnectionId;
      const activeRider = activeRiders.filter(x => x.userId === this.userId);
      const riderRequest = {
        tripId: this.tripId,
        tripFee: this.tripPricePerRider,
        tripConnectionId,
        activeRider
      };
      this.showNavBtn = true;
      localStorage.setItem('riderRequest', JSON.stringify(riderRequest));
      this.isTrips = true;
    });
  }
  getAllAvailableTrips() {
    this.broadcastService.toggleAvailableTrips(false);
  }

  navigateToBookSeat() {
    this.router.navigate(['rider/bookSeat']);
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
