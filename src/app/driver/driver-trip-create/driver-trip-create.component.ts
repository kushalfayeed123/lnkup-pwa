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
      tripPickup: [{ value: this.pickup, disabled: true }, [Validators.required]],
      tripDestination: [{ value: this.destination, disabled: true }, [Validators.required]],
      driverDataId: [this.driverDataId, [Validators.required]],
      driverTripStatus: [1, [Validators.required]],
      driverStartLongitude: ['', [Validators.required]],
      driverStartLatitude: ['', [Validators.required]],
      driverEndLongitude: ['', [Validators.required]],
      driverEndLatitude: ['', [Validators.required]],
      maxRiderNumber: ['', [Validators.required]],
      tripStartDateTime: ['', [Validators.required]],
      aggregrateTripFee: [this.fare, [Validators.required]],
      tripType: ['Regular', [Validators.required]],
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
        this.tripForm.patchValue({
          driverEndLatitude: this.tripEndLat,
          driverEndLongitude: this.tripEndLng,
          driverStartLatitude: this.tripStartLat,
          driverStartLongitude: this.tripStartLng
        });
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
          this.tripForm.patchValue({
            driverEndLatitude: this.tripEndLat,
            driverEndLongitude: this.tripEndLng,
            driverStartLatitude: this.tripStartLat,
            driverStartLongitude: this.tripStartLng
          });
          this.loading = false;
        });
      }, 5000);
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
      const message = 'Your profile is incomplete. Please complete your driver registration to start sharing a ride.';
      this.notifyService.showErrorMessage(message);
      this.loader = false;
      return;

    } else if (this.driverStatus < 1) {
      const message = 'Your document is currently under review for approval. We will get back to you as soon as we complete our background checks.';
      this.notifyService.showErrorMessage(message);
      this.loader = false;
      return;
    } else {
      const seatCapacity = 4;
      const maxRiderNumber = this.tripForm.value.maxRiderNumber;
      if (this.tripForm.valid && maxRiderNumber <= seatCapacity) {

        this.tripForm.patchValue({
          tripPickup: this.pickup,
          tripDestination: this.destination
        });

        this.activeTripService.createTrip(this.tripForm.getRawValue())
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
        const message = 'Number of riders exceeds car seating capacity';
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
