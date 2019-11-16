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
import { DriverDataDataService } from 'src/app/services/data/driver-data/driver-data.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';

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
  showDestination: boolean;
  showPickup: boolean;
  pickupName: any;
  locationObject: { destination: string,
                    pickup: string };
  showLanding: boolean;
  pickupFull: any;
  destinationFull: any;
  destinationLocation: any;
  pickupLocation: any;
  driverDataId: string;
  currentUserId: string;
  driverNavigate: boolean;
  driverImage = '';
  origin: { lat: any; lng: any; };
  destination: { lat: any; lng: any; };
  renderOptions: { polylineOptions: { strokeColor: string; geodesic: boolean; strokeOpacity: number; strokeWeight: number; editable: boolean; }; };
  platNumber: any;
  plateNumber: any;

  constructor(private router: Router,
              private activeTripService: ActiveTripDataService,
              private fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private authService: AuthenticateDataService,
              private mapService: MapBroadcastService,
              private driverDataService: DriverDataDataService,
              private notificationService: NotificationsService,
              private broadCastService: BroadcastService) {
                this.startTrip();
               }

  ngOnInit() {
    this.route.queryParams
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(param => {
      this.driverNavigate = param.driverNav;
    });
    this.showLanding = true;
    this.showDestination = true;
    this.getCurrentLocation();
    this.getDriverData();
    this.zoom = 15;
    this.route.params.subscribe(p => {
      const userId = p.id;
      this.getUserById(userId);
      this.getUserProfileImage(userId);

    });
    this.notificationService.intiateConnection();
  }

  startTrip() {
    this.broadCastService.startTrip
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(trip => {
      this.startTrip = trip;
      this.getUserDirection();
    });
  }
  getUserById(userId) {
    this.loading = true;
    this.authService
      .getById(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        this.currentUser = user;
        this.userId = user.userId.substring(27).toUpperCase();
        this.loading = false;
      });
  }
  async getDriverData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.id;
    await this.driverDataService.getDriverByDriverId(userId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.driverDataId = data.driverDataId;
      this.plateNumber = data.carDocument2.toUpperCase();
      localStorage.setItem('driverDataId', this.driverDataId);
    });
    // this.updateDriverConnect();
  }
  async getUserProfileImage(userId) {
    await this.authService.getUserImage(userId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(img => {
      if (img == null) {
        return;
      } else {
        this.driverImage = 'data:image/png;base64,' + img.image;
      }
    });
  }
  getCurrentLocation() {
    this.mapService.getCurrentLocation();
    this.mapService.locationObject.subscribe(loc => {
        this.latitude = loc.lat;
        this.longitude  = loc.lng;
        this.currentLocation = {lat: loc.lat, lng: loc.lng};
      });
  }
  getActiveTripById() {
    const activeTrip = JSON.parse(localStorage.getItem('activeTripId'));
    const activeTripId = activeTrip.dataDriverId;
    this.activeTripService.getTripsById(activeTripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(response => {
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

    this.activeTripService.updateTrip(newActiveTrip, activeTripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(response => {
      this.getActiveTripById();
    });
  }
  updateDriverConnect() {
    const connectionId = sessionStorage.getItem('clientConnectionId');
    const driverId =  localStorage.getItem('driverDataId');
    this.driverDataService.updateDriverData(driverId, connectionId.toString())
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      console.log('connect id was updated');
    });
  }
  openErrorMessage() {
    this._snackBar.openFromComponent(ErrorMessageComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['dark-snackbar-error']
    });
  }

  storeUserDestinationLocation(location) {
    this.destinationLocation =  location;
    this.destinationName = location.name;
    this.destinationFull = location.formatted_address;
  }

  storeUserPickupLocation(location) {
    this.pickupLocation =  location;
    this.pickupName = location.name;
    this.pickupFull = location.formatted_address;
  }
  getUserDirection() {
    const origin = JSON.parse(localStorage.getItem('origin'));
    const  destination = JSON.parse(localStorage.getItem('destination'));
    if (origin && destination) {
      this.getDirection(origin, destination);
    } else {
      return;
    }
  }
  getDirection(origin, destination) {
    setTimeout(() => {
      const cl = origin;
      this.origin = { lat: cl.lat, lng: cl.lng };
      this.destination = { lat: destination.lat, lng: destination.lng };
      this.renderOptions = { polylineOptions: { strokeColor: '#d54ab6',
                                              geodesic : true,
                                              strokeOpacity: 0.6,
                                              strokeWeight: 5,
                                              editable: false, } };
      this.latitude = cl.lat;
      this.longitude = cl.lng;
    }, 2000); 
  }
  setDestination() {
    this.showDestination = false;
    this.showPickup = true;
    this.mapService.findDestination(this.destinationFull);
  }
  setPickup() {
    this.showDestination = true;
    this.showLanding = false;
    this.mapService.findOrigin(this.pickupFull);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
