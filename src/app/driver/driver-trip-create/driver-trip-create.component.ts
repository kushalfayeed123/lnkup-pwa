import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { formatDate } from '@angular/common';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import * as moment from 'moment';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { slideInAnimation } from 'src/app/services/misc/animation';


@Component({
  selector: 'app-driver-trip-create',
  templateUrl: './driver-trip-create.component.html',
  styleUrls: ['./driver-trip-create.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class DriverTripCreateComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  @Input() destination;
  @Input() pickup;
  @Input() darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#424242',
      buttonColor: '#fff'
    },
    dial: {
      dialBackgroundColor: '#555',
    },
    clockFace: {
      clockFaceBackgroundColor: '#555',
      clockHandColor: '#9fbd90',
      clockFaceTimeInactiveColor: '#fff'
    }
  };
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
  driverCardStatus: any;
  currentDateTime: any;
  onGoingTrip: boolean;

  constructor(private fb: FormBuilder, private mapService: MapBroadcastService,
    private activeTripService: ActiveTripDataService,
    private router: Router,
    private notifyService: NotificationsService,
    private broadcastService: BroadcastService) {

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
      tripConnectionId: [this.connectionId, [Validators.required]],
      actualTripStartDateTime: ['']
    });
  }

  getDriverDetails() {
    const driverData = JSON.parse(localStorage.getItem('driverData'));

    this.driverDataId = driverData.driverDataId;
    this.driverStatus = driverData.driverStatus;
    const connectionId = sessionStorage.getItem('clientConnectionId');
    this.connectionId = connectionId;
    this.getDriverPaymentDetails();
  }

  getDriverPaymentDetails() {
    this.broadcastService.paymentStatus
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        this.driverCardStatus = status;
        if (!status) {
          setTimeout(() => {
            this.notifyService.showErrorMessage('Please add your card details to continue.');
          }, 10000);
        }
      });
  }
  getLocationCoordinates() {
    this.loading = true;
    const tripStartLatLng = JSON.parse(localStorage.getItem('currentLocation'));
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
    const date = new Date().getTime();
    this.dateNow = formatDate(date, ' h:mm a', 'en-US').toLowerCase().substring(1);
    this.currentDateTime = new Date().toString();
    console.log(this.currentDateTime);
  }

  formatActualDateTime() {
    const tripStartTime = this.tripForm.value.tripStartDateTime;
    const splitTime = tripStartTime.split(':');
    const hr = Number(splitTime[0]);
    const minAmPm = splitTime[1];
    const minFirst = minAmPm.split('')[0];
    const minSecond = minAmPm.split('')[1];
    const minP = minAmPm.split('')[3];
    const minM = minAmPm.split('')[4];
    const min = Number(`${minFirst}${minSecond}`);
    const pm = `${minP}${minM}`;
    let today = new Date();
    if (pm === 'PM') {
      today = new Date(today.setHours(hr + 12));
      today = new Date(today.setMinutes(min));

    } else {
      today = new Date(today.setHours(hr));
      today = new Date(today.setMinutes(min));
    }
    localStorage.setItem('startTime', today.toString());
    this.tripForm.patchValue({ actualTripStartDateTime: today.toString() });
  }
  broadCastTrip() {
    this.formatActualDateTime();
    this.loader = true;
    if (!this.driverDataId) {
      const message = 'Your profile is incomplete. Please complete your driver registration to start sharing your ride.';
      this.notifyService.showErrorMessage(message);
      this.loader = false;
      return;

    } else if (!this.driverCardStatus) {
      const message = 'Please add your card details to continue.';
      this.notifyService.showErrorMessage(message);
      this.loader = false;
      return;

    } else if (this.driverStatus < 1) {
      // tslint:disable-next-line: max-line-length
      const message = 'Your document is currently under review for approval. We will contact you as soon as we complete our background checks. Thank you for riding with us.';
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
            const message = 'You are now broadcasting your trip.';
            this.notifyService.showSuccessMessage(message);
            this.onGoingTrip = true;
            localStorage.setItem('onGoingTrip', JSON.stringify(this.onGoingTrip));
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
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
