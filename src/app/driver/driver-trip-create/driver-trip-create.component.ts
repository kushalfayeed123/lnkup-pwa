import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/business/notificatons.service';

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
  dateNow: string;
  tripDistance: number;
  tripTime: any;
  tripPricePerRider: number;
  connectionId: string;

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
      tripPickup: [this.pickup],
      tripDestination: [this.destination],
      driverDataId: [this.driverDataId],
      driverTripStatus: [1],
      driverStartLongitude: [this.tripStartLng],
      driverStartLatitude: [this.tripStartLat],
      driverEndLongitude: [this.tripEndLng],
      driverEndLatitude: [this.tripEndLat],
      maxRiderNumber: ['', [Validators.required]],
      tripStartDateTime: ['', [Validators.required]],
      aggregrateTripFee: [this.fare, [Validators.required]],
      tripType: ['', [Validators.required]],
      allowedRiderCount: [0],
      tripConnectionId  : [this.connectionId]
    });
  }

  getDriverDetails() {
    const driverDataId = localStorage.getItem('driverDataId');
    this.driverDataId = driverDataId;
    const connectionId = sessionStorage. getItem('clientConnectionId');
    this.connectionId = connectionId;
  }

  getLocationCoordinates() {
      const tripStartLatLng = JSON.parse(localStorage.getItem('origin'));
      const tripEndLatLng = JSON.parse(localStorage.getItem('destination'));
      this.tripStartLat = tripStartLatLng.lat.toString();
      this.tripStartLng = tripStartLatLng.lng.toString();
      this.tripEndLat = tripEndLatLng.lat.toString();
      this.tripEndLng = tripEndLatLng.lng.toString();
      const origin = new google.maps.LatLng(tripStartLatLng.lat, tripStartLatLng.lng);
      const destination = new google.maps.LatLng(tripEndLatLng.lat, tripEndLatLng.lng);

      new google.maps.DistanceMatrixService().getDistanceMatrix({origins: [origin], destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING}, (results: any) => {
          this.tripDistance =  (results.rows[0].elements[0].distance.value / 1000);
          this.tripTime = (results.rows[0].elements[0].duration.text);
          const pricePerRiderPerKm = 37;
          const tripPricePerRider = Math.round(pricePerRiderPerKm * this.tripDistance);
          this.tripPricePerRider = tripPricePerRider;
          console.log('trip price per rider', tripPricePerRider);
        });
  }

  updateTrip() {
    
  }
  computeTripFare(value) {
    const tripFare = value * this.tripPricePerRider;
    this.fare = tripFare;
    this.tripForm.patchValue({
      aggregrateTripFee:  this.fare
    });
    console.log(tripFare);
  }
  getTimeValues() {
    this.dateNow = Date.now().toString();
  }
  broadCastTrip() {
    if (!this.driverDataId) {
      const message = 'You can not create a trip at the moment. Please update your information in your profile.';
      this.notifyService.showErrorMessage(message);
      return;

    } else {
      const seatCapacity = 4;
      const maxRiderNumber = this.tripForm.value.maxRiderNumber;
      if (this.tripForm.valid && maxRiderNumber <= seatCapacity) {
        this.activeTripService.createTrip(this.tripForm.value)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(trip =>  {
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
        const message = 'number of riders exceeds car capacity';
        this.notifyService.showErrorMessage(message);
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
