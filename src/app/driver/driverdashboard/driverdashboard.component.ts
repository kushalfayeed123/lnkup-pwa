import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ErrorMessageComponent } from 'src/app/components/error-message/error-message.component';
import { MatSnackBar } from '@angular/material';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { Users } from 'src/app/models/Users';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './driverdashboard.component.html',
  styleUrls: ['./driverdashboard.component.scss']
})
export class DriverdashboardComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  durationInSeconds = 4;
  activeTripForm: FormGroup;
  loading: boolean;
  activeUser: ActiveTrips;
  activeTrip: any;
  latitude: any;
  longitude: any;
  currentLocation: { lat: any; lng: any; };
  zoom: number;
  destinationName: any;
  location: any;
  currentUser: Users;
  userId: string;

  constructor(private router: Router,
              private activeTripService: ActiveTripDataService,
              private fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private authService: AuthenticateDataService,
              private mapService: MapBroadcastService) {
              //   this.activeTripForm = this.fb.group([
              //     tripPickup: ['', Validators.required],
              //     driverDataId: ['', Validators.required],
              //     driverTripStatus: [1],
              //     driverStartLongitude: ['', Validators.required],
              //     driverStartLatitude: ['', Validators.required],
              //     driverEndLongitude: ['', Validators.required],
              //     drievrEndLatitude: ['', Validators.required],
              //     maxRiderNumber: ['', Validators.required],
              //     tripStartDateTime: ['', Validators.required],
              //     tripEndDateTime: ['', Validators.required],
              //     departureDateTime: ['', Validators.required],
              //     allowedRiderCount: [0],
              //     tripType: ['', Validators.required]
              // ]);
               }

  ngOnInit() {
    this.getCurrentLocation();
    this.zoom = 15;
    this.route.params.subscribe(p => {
      const userId = p.id;
      this.getUserById(userId);
    });
  }

  getUserById(userId) {
    this.authService
      .getById(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        this.currentUser = user;
        this.userId = user.userId.substring(27).toUpperCase();
        console.log('user viewing this screen', this.currentUser);
      });
  }
  getCurrentLocation() {
        console.log('get current location');
        this.mapService.locationObject.subscribe(loc => {
        this.latitude = loc.lat;
        this.longitude  = loc.lng;
        this.currentLocation = {lat: loc.lat, lng: loc.lng};
      });
  }

  createTrip() {
    this.activeTripService.CreateTrip(this.activeTripForm.value)
    .pipe(takeUntil(this.unsubscribe$))
    .subcribe(trip =>  {
      this.activeTrip = trip;
      localStorage.setItem('activeTripId', this.activeTrip.tripId);
      alert('Trip has been created');
    }, error => {
      setTimeout(() => {
        this.loading = false;
        this.openErrorMessage();
      }, 3000);
    });

  }

  getActiveTripById() {
    const activeTripId = localStorage.getItem('activeTripId');
    this.activeTripService.getTripsById(activeTripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subcribe(response => {
      this.activeTrip = response;
    });
  }

  AcceptRiderRequest() {
    this.updateActiveTrip();
  }

  updateActiveTrip() {
    this.getActiveTripById();
    const activeTrip = this.activeTrip;
    const activeTripRider = this.activeTrip.activeRiders;
    const allowedRiderCount = activeTripRider.length;
    const activeTripId = activeTrip.activeTripId;

    const newActiveTrip = {
      driverTripStatus: activeTrip.driverTripStatus,
      allowedRiderCount,
      driverStartLat: activeTrip.driverStartLat,
      driverStartLng: activeTrip.driverStartLng,
      driverEndLat: activeTrip.driverEndLat,
      driverEndLng: activeTrip.driverEndLng
    };

    this.activeTripService.UpdateTrip(newActiveTrip, activeTripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subcribe(response => {
      this.getActiveTripById();
    });
  }
  openErrorMessage() {
    this._snackBar.openFromComponent(ErrorMessageComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['dark-snackbar-error']
    });
  }

  storeUserCurrentLocation(location) {
    this.location = location;
    this.destinationName = location.name;
    console.log('destination', location);
  }

  setDestination() {
    alert(this.location.formatted_address + ' ' + 'has been set as your destination');
    console.log('set destination', this.location.formatted_address);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
