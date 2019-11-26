import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-driver-trip-create',
  templateUrl: './driver-trip-create.component.html',
  styleUrls: ['./driver-trip-create.component.scss']
})
export class DriverTripCreateComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  @Input() destination;
  @Input() pickup;
  fare: number;
  tripForm: FormGroup;
  driverDataId: string;
  tripStartLat: any;
  tripStartLng: any;
  tripEndLat: any;
  tripEndLng: any;
  activeTrip: any;
  loading: boolean;
  tripDistance: number;
  tripTime: any;
  tripPricePerRider: number;
  connectionId: string;
  dateNow: string;
  approvedStatus: any;
  driverStatus: any;
  loader: boolean;

  constructor(private fb: FormBuilder, private mapService: MapBroadcastService,
    private activeTripService: ActiveTripDataService,
    private router: Router,
    private notifyService: NotificationsService) {

  }

  ngOnInit() {
    this.getDriverDetails();
    this.getLocationCoordinates();
    this.getTimeValues();
    this.fare = 0;
    this.tripForm = this.fb.group({
      tripPickup: [this.pickup, [Validators.required]],
      tripDestination: [this.destination, [Validators.required]],
      driverDataId: [this.driverDataId, [Validators.required]],
      driverTripStatus: [1, [Validators.required]],
      driverStartLongitude: [this.tripStartLng, [Validators.required]],
      driverStartLatitude: [this.tripStartLat, [Validators.required]],
      driverEndLongitude: [this.tripEndLng, [Validators.required]],
      driverEndLatitude: [this.tripEndLat, [Validators.required]],
      maxRiderNumber: ['', [Validators.required]],
      tripStartDateTime: ['', [Validators.required]],
      aggregrateTripFee: [this.fare, [Validators.required]],
      tripType: ['', [Validators.required]],
      allowedRiderCount: [0, [Validators.required]],
      tripConnectionId: [this.connectionId, [Validators.required]]
    });
  }

  getDriverDetails() {
    const driverData = JSON.parse(localStorage.getItem('driverData'));
    this.driverDataId = driverData.driverDataId;
    this.driverStatus = driverData.driverStatus;
    const connectionId = sessionStorage.getItem('clientConnectionId');
    this.connectionId = connectionId;
  }


  getLocationCoordinates() {
    this.loading = true;
    const tripStartLatLng = JSON.parse(localStorage.getItem('origin'));
    const tripEndLatLng = JSON.parse(localStorage.getItem('destination'));
    if (tripEndLatLng !== null && tripStartLatLng !== null) {
      this.tripStartLat = tripStartLatLng.lat.toString();
      this.tripStartLng = tripStartLatLng.lng.toString();
      this.tripEndLat = tripEndLatLng.lat.toString();
      this.tripEndLng = tripEndLatLng.lng.toString();
      const origin = new google.maps.LatLng(tripStartLatLng.lat, tripStartLatLng.lng);
      const destination = new google.maps.LatLng(tripEndLatLng.lat, tripEndLatLng.lng);

      new google.maps.DistanceMatrixService().getDistanceMatrix({
        origins: [origin], destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING
      }, (results: any) => {
        this.tripDistance = (results.rows[0].elements[0].distance.value / 1000);
        this.tripTime = (results.rows[0].elements[0].duration.text);
        const pricePerRiderPerKm = 37;
        const tripPricePerRider = Math.round(pricePerRiderPerKm * this.tripDistance);
        this.tripPricePerRider = tripPricePerRider;
        console.log('trip price per rider', tripPricePerRider);
        this.loading = false;
      });
    } else {
      setTimeout(() => {
        const tripStartLatLng = JSON.parse(localStorage.getItem('origin'));
        const tripEndLatLng = JSON.parse(localStorage.getItem('destination'));
        this.tripStartLat = tripStartLatLng.lat.toString();
        this.tripStartLng = tripStartLatLng.lng.toString();
        this.tripEndLat = tripEndLatLng.lat.toString();
        this.tripEndLng = tripEndLatLng.lng.toString();
        const origin = new google.maps.LatLng(tripStartLatLng.lat, tripStartLatLng.lng);
        const destination = new google.maps.LatLng(tripEndLatLng.lat, tripEndLatLng.lng);

        new google.maps.DistanceMatrixService().getDistanceMatrix({
          origins: [origin], destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING
        }, (results: any) => {
          this.tripDistance = (results.rows[0].elements[0].distance.value / 1000);
          this.tripTime = (results.rows[0].elements[0].duration.text);
          const pricePerRiderPerKm = 37;
          const tripPricePerRider = Math.round(pricePerRiderPerKm * this.tripDistance);
          this.tripPricePerRider = tripPricePerRider;
          console.log('trip price per rider', tripPricePerRider);
          this.loading = false;
        });
      }, 2000);
    }
  }

  updateTrip() {

  }
  computeTripFare(value) {
    const tripFare = value * this.tripPricePerRider;
    this.fare = tripFare;
    this.tripForm.patchValue({
      aggregrateTripFee: this.fare
    });
    console.log(tripFare);
  }
  getTimeValues() {
    const dateNow = new Date().getTime();
    this.dateNow = formatDate(dateNow, ' hh:mm a', 'en-US');
    // console.log(dateNow);
  }
  broadCastTrip() {
    this.loader = true;
    if (!this.driverDataId) {
      const message = 'You can not create a trip at the moment. Please update your profile for approval.';
      this.notifyService.showErrorMessage(message);
      this.loader = false;
      return;

    } else if (this.driverStatus < 1) {
      const message = 'Your aprroval is pending. We will review your documents and get back to you.';
      this.notifyService.showErrorMessage(message);
      this.loader = false;
      return;
    } else {
      const seatCapacity = 4;
      const maxRiderNumber = this.tripForm.value.maxRiderNumber;
      if (this.tripForm.valid && maxRiderNumber <= seatCapacity) {
        this.activeTripService.createTrip(this.tripForm.value)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(trip => {
            this.loader = false;
            this.activeTrip = trip;
            localStorage.setItem('activeTrip', JSON.stringify(this.activeTrip));
            const message = 'Your trip has been created and is currently being broadcasted';
            this.notifyService.showSuccessMessage(message);
            this.router.navigate(['driver/rider-request']);
          }, error => {
            setTimeout(() => {
              this.loading = false;
            }, 3000);
          });
        } else {
        this.loader = false;
        const message = 'number of riders exceeds car capacity';
        this.notifyService.showErrorMessage(message);
      }
    }
    // const newDate = new Date(this.tripForm.value.tripStartDateTime)
    // console.log(newDate);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
