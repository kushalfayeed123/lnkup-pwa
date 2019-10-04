import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private mapService: MapBroadcastService,
              private activeTripService: ActiveTripDataService,
              private router: Router) {

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
      aggregrateTripFee: [0, [Validators.required]],
      tripType: ['', [Validators.required]],
      allowedRiderCount: [0],
    });
  }

  getDriverDetails() {
    const driverDataId = localStorage.getItem('driverDataId');
    this.driverDataId = driverDataId;
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
          const pricePerRiderPerKm = 44;
          const tripPricePerRider = Math.round(pricePerRiderPerKm * this.tripDistance);
          this.tripPricePerRider = tripPricePerRider;
          console.log('trip price per rider', tripPricePerRider);
        })
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
    const seatCapacity = 4;
    const maxRiderNumber = this.tripForm.value.maxRiderNumber;
    if (this.tripForm.valid && maxRiderNumber <= seatCapacity) {
      console.log('trip value', this.tripForm.value);
      this.activeTripService.createTrip(this.tripForm.value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(trip =>  {
        this.activeTrip = trip;
        localStorage.setItem('activeTrip', JSON.stringify(this.activeTrip));
        alert('Trip has been created');
        this.router.navigate(['driver/rider-request']);
      }, error => {
        setTimeout(() => {
          this.loading = false;
        }, 3000);
      });
    } else {
      console.log('number of riders exceeds car capacity');
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
