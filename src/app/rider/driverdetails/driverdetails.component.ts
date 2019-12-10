import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { Subject } from 'rxjs';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';

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
  image: any;
  userId: any;
  tripStartTime: string;


  constructor(private mapService: MapBroadcastService,
              private activeTripService: ActiveTripDataService,
              private broadcastService: BroadcastService,
              private notificationService: NotificationsService,
              private router: Router) { }

  ngOnInit() {
    this.getTripId();
  }

  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user.id;
  }

  getTripId() {
    this.mapService.tripId
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.tripId = data;
      this.activeTripService.getTripsById(this.tripId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(trip => {
        this.image = trip.tripDriver.driver.userImage.image;
        this.broadcastService.publishDriverImage(trip);
        this.broadcastService.toggleAvailableTrips(trip);
        console.log(trip);
        const max = trip.maxRiderNumber;
        const allowed = trip.allowedRiderCount;
        const driverId = trip.tripDriver.driverId;
        const driverUserId = trip.tripDriver.driver.userId;
        const driverEmail = trip.tripDriver.driver.email;
        const tripPickup = trip.tripPickup;
        const activeRiders = trip.activeRiders;
        const plateNumber = trip.tripDriver.carDocument2;
        const driverAccountId = trip.tripDriver.paymentAccountId;
        const tripDetails = {allowedRiderCount: allowed, maxRiderNumber: max, driverId,
           driverEmail, tripPickup, driverUserId, plateNumber, driverAccountId};
        localStorage.setItem('tripDetails', JSON.stringify(tripDetails));
        if(allowed  === 0) {
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
        this.isTrips = true;

        const tripDestination = new google.maps.LatLng(destinationLat, destinationLng);
        const pickupLocation = new google.maps.LatLng(pickupCoordinates.lat, pickupCoordinates.lng);
          // tslint:disable-next-line: max-line-length
        new google.maps.DistanceMatrixService().getDistanceMatrix({origins: [pickupLocation], destinations: [tripDestination],
              travelMode: google.maps.TravelMode.DRIVING}, (results: any) => {
             const tripDistance =  (results.rows[0].elements[0].distance.value / 1000);
             const pricePerKilometer = 37;
             this.tripPricePerRider = Math.round(pricePerKilometer * tripDistance);
             const tripConnectionId = trip.tripConnectionId;
             const activeRider = activeRiders.filter(x => x.userId === this.userId);
             const riderRequest = {tripId: this.tripId,
                                   tripFee: this.tripPricePerRider,
                                   tripConnectionId,
                                  activeRider};
            console.log('ride request', riderRequest);
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
