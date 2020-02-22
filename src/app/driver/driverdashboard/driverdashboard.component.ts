import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
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
import { LocationDataService } from 'src/app/services/data/location/location.data.service';
import { interval } from 'rxjs';
import { slideInAnimation } from 'src/app/services/misc/animation';

@Component({
  selector: 'app-dashboard',
  templateUrl: './driverdashboard.component.html',
  styleUrls: ['./driverdashboard.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
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
  currentLocation: { lat: any; lng: any };
  zoom: number;
  style = [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#212121'
        }
      ]
    },
    {
      elementType: 'labels.icon',
      stylers: [
        {
          visibility: 'off'
        }
      ]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#757575'
        }
      ]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#212121'
        }
      ]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [
        {
          color: '#757575'
        }
      ]
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#9e9e9e'
        }
      ]
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#bdbdbd'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#757575'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [
        {
          color: '#181818'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#616161'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1b1b1b'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#2c2c2c'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#8a8a8a'
        }
      ]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [
        {
          color: '#373737'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [
        {
          color: '#3c3c3c'
        }
      ]
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [
        {
          color: '#4e4e4e'
        }
      ]
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#616161'
        }
      ]
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#757575'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#000000'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#3d3d3d'
        }
      ]
    }
  ];
  destinationName: any;
  location: any;
  currentUser: Users;
  userId: string;
  showDestination: boolean;
  showPickup: boolean;
  pickupName: any;
  locationObject: {
    destination: string;
    pickup: string;
  };
  showLanding: boolean;
  pickupFull: any;
  destinationFull: any;
  destinationLocation: any;
  pickupLocation: any;
  driverDataId: string;
  currentUserId: string;
  driverNavigate: boolean;
  driverImage = '';
  origin: { lat: any; lng: any };
  destination: { lat: any; lng: any };
  renderOptions: {
    polylineOptions: {
      strokeColor: string;
      geodesic: boolean;
      strokeOpacity: number;
      strokeWeight: number;
      editable: boolean;
    };
  };
  platNumber: any;
  plateNumber: any;
  driverStatus: any;
  userPayment: boolean;
  riderLocation: any;
  riderLocationsLat: any[] = [];
  riderLocationsLong: any[] = [];

  constructor(
    private router: Router,
    private activeTripService: ActiveTripDataService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private authService: AuthenticateDataService,
    private mapService: MapBroadcastService,
    private driverDataService: DriverDataDataService,
    private notificationService: NotificationsService,
    private broadCastService: BroadcastService,
    private locationService: LocationDataService
  ) {
    this.notificationService.angularFireMessenger();
    // this.notificationService.deleteSubscription();
    this.notificationService.requestPermision();
    this.notificationService.receiveMessage();
    this.notificationService.currentMessage.subscribe(res => {
      // alert(res);
    });
    // this.notificationService.tokenRefresh();
    this.startTrip();
    this.getCurrentLocation();
    this.setIntervalCall();
  }

  ngOnInit() {
    // this.activeTripCheck();
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(param => {
        window.scrollTo(0, 0);
        this.driverNavigate = param.driverNav;
        this.getDriverData();
      });
    this.sideNavCheck();
    this.showLanding = true;
    this.showDestination = true;
    this.zoom = 15;
    this.route.params.subscribe(p => {
      const userId = p.id;
      this.getUserById(userId);
      this.getUserProfileImage(userId);
    });
  }

  sideNavCheck() {
    if (!this.driverNavigate) {
      this.broadCastService.publishSideNavValue(true);
    } else {
      return;
    }
  }

  activeTripCheck() {
    const onGoingTrip = JSON.parse(localStorage.getItem('onGoingTrip'));
    if (onGoingTrip === false) {
      this.showLanding = true;
    } else {
      const currentRoute = JSON.parse(localStorage.getItem('currentRoute'));
      const navigationExtras: NavigationExtras = {
        queryParamsHandling: 'preserve',
        preserveFragment: true
      };
      this.router.navigateByUrl(`${currentRoute}`, navigationExtras);
    }
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
        const userPaymentData = user.userPaymentData;
        if (userPaymentData.length < 1) {
          this.userPayment = false;
        } else {
          this.userPayment = true;
        }
        this.broadCastService.publishUserPaymentStatus(this.userPayment);
      });
  }
  getDriverData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.id;
    this.driverDataService
      .getDriverByDriverId(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.driverDataId = data.driverDataId;
        this.plateNumber = data.carDocument2.toUpperCase();
        this.driverStatus = data.driverStatus;
        const driverData = {
          driverDataId: this.driverDataId,
          driverStatus: this.driverStatus
        };
        localStorage.setItem('driverData', JSON.stringify(driverData));
      });
    // this.updateDriverConnect();
  }
  getUserProfileImage(userId) {
    this.authService
      .getUserImage(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(img => {
        if (img == null) {
          return;
        } else {
          this.driverImage = 'data:image/png;base64,' + img.image;
        }
      });
  }
  setIntervalCall() {
    interval(30000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(x => {
        this.getCurrentLocation();
        setTimeout(() => {
          this.broadCastCurrentLocation();
          this.getAllRidersLocations();
        }, 10000);
      });
  }

  getAllRidersLocations() {
    this.locationService
      .getAllLocations()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(loc => {
        this.riderLocation = loc.filter(r => r.userRole === 'Rider');
        this.riderLocation.forEach(element => {
          const long = Number(element.pickupLongitude);
          const lat = Number(element.pickupLatitude);
          this.riderLocationsLong = [...this.riderLocationsLong, long];
          this.riderLocationsLat = [...this.riderLocationsLat, lat];
        });
      });
  }
  getCurrentLocation() {
    this.mapService.getCurrentLocation();
    this.mapService.locationObject.subscribe(loc => {
      this.latitude = loc.lat;
      this.longitude = loc.lng;
      this.currentLocation = { lat: loc.lat, lng: loc.lng };
    });
  }
  broadCastCurrentLocation() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.locationService
      .getLocationsByUserId(user.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res) {
          this.updateUserLocation(user.id);
        } else {
          this.createUserLocation();
        }
      });
  }

  createUserLocation() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const locationPayload = {
      userId: user.id,
      pickupLongitude: this.longitude,
      pickupLatitude: this.latitude,
      userRole: user.role
    };
    this.locationService
      .create(locationPayload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {});
  }
  updateUserLocation(id) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const locationPayload = {
      userId: user.id,
      pickupLongitude: this.longitude,
      pickupLatitude: this.latitude,
      userRole: user.role
    };
    this.locationService
      .update(id, locationPayload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {});
  }

  getActiveTripById() {
    const activeTrip = JSON.parse(localStorage.getItem('activeTripId'));
    const activeTripId = activeTrip.dataDriverId;
    this.activeTripService
      .getTripsById(activeTripId)
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

    this.activeTripService
      .updateTrip(newActiveTrip, activeTripId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        this.getActiveTripById();
      });
  }
  updateDriverConnect() {
    const connectionId = sessionStorage.getItem('clientConnectionId');
    const driverId = localStorage.getItem('driverDataId');
    this.driverDataService
      .updateDriverData(driverId, connectionId.toString())
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
    this.destinationLocation = location;
    this.destinationName = location.name;
    this.destinationFull = location.formatted_address;
    this.mapService.findDestination(this.destinationFull);
  }

  storeUserPickupLocation(location) {
    this.pickupLocation = location;
    this.pickupName = location.name;
    this.pickupFull = location.formatted_address;
    this.mapService.findOrigin(this.pickupFull);
  }
  getUserDirection() {
    const origin = JSON.parse(localStorage.getItem('currentLocation'));
    const destination = JSON.parse(localStorage.getItem('destination'));
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
      this.renderOptions = {
        polylineOptions: {
          strokeColor: '#e040fb',
          geodesic: true,
          strokeOpacity: 0.6,
          strokeWeight: 5,
          editable: false
        }
      };
      this.latitude = cl.lat;
      this.longitude = cl.lng;
    }, 2000);
  }
  setDestination() {
    this.showDestination = false;
    this.showPickup = true;
  }
  setPickup() {
    this.showDestination = true;
    if (!this.driverDataId) {
      this.showDestination = false;
      this.notificationService.showErrorMessage(
        'Sorry you can not create a trip at the moment. Please complete your vehicle registration'
      );
    } else {
      this.showLanding = false;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
