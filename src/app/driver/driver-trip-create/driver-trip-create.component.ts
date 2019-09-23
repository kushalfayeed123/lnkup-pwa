import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';

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

  constructor(private fb: FormBuilder, private mapService: MapBroadcastService,
              private activeTripService: ActiveTripDataService) {

  }

  ngOnInit() {
    this.getDriverDetails();
    this.getLocationCoordinates();
    this.getTimeValues();
    this.fare = 1200;
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
      aggregrateTripFee: [this.fare],
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
        localStorage.setItem('activeTripId', this.activeTrip.tripId);
        alert('Trip has been created');
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
