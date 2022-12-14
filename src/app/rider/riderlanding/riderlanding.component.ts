import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  NgZone,
  ElementRef
} from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Subject, interval, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { MatSnackBar } from '@angular/material';
import { SearchMessageComponent } from 'src/app/components/search-message/search-message.component';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import {
  Location,
  Appearance
} from '@angular-material-extensions/google-maps-autocomplete';
import PlaceResult = google.maps.places.PlaceResult;
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { UserPaymentToken } from 'src/app/models/payment';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { LocationDataService } from 'src/app/services/data/location/location.data.service';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { GoogleMapsScriptProtocol, AgmMap } from '@agm/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { bounce } from 'ng-animate';
import { Select, Store } from '@ngxs/store';
import { SubSink } from 'subsink/dist/subsink';
import { Users } from 'src/app/models/Users';
import { AppState } from 'src/app/state/app/app.state';
import { ShowLeftNav, ShowLoader, ShowBackButton } from 'src/app/state/app/app.actions';
import { GetTrips, GetAvailableTrips, ShowEmptyTripMessage } from 'src/app/state/trip/trips.action';
import { TripsState } from 'src/app/state/trip/trips.state';


@Component({
  selector: 'app-riderlanding',
  templateUrl: './riderlanding.component.html',
  styleUrls: ['./riderlanding.component.scss'],
  animations: [
    [
      trigger('bounce', [transition('* => *', useAnimation(bounce))]),
      slideInAnimation
    ]
  ],
  host: { '[@slideInAnimation]': '' }
})
export class RiderlandingComponent implements OnInit, OnDestroy {

  @Select(AppState.getCurrentUser) currentUser$: Observable<Users>;
  @Select(TripsState.getTrips) trips$: Observable<ActiveTrips[]>;
  @Select(TripsState.getSelectedTrip) selectedTrips$: Observable<ActiveTrips>;
  @Select(TripsState.showEmptyTripMessage) emptyTrip$: Observable<boolean>;





  private unsubscribe$ = new Subject<void>();
  public userId: string;
  public circleRadius = 70;
  public appearance = Appearance;
  private heatmap: google.maps.visualization.HeatmapLayer = null;

  @ViewChild('search', { static: true }) public searchElement: ElementRef;
  @ViewChild(AgmMap, { static: false }) map: AgmMap;

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

  public markerOptions = {
    origin: {
      icon: './assets/Images/direction.svg',
      scaledSize: {
        width: 20,
        height: 20
      }

    },
    destination: {
      icon: './assets/Images/direction.svg',
      scaledSize: {
        width: 20,
        height: 20
      }

    },
  }

  showDirection: boolean;
  searchControl: FormControl;
  durationInSeconds = 10;
  longitude: any;
  latitude: any;
  zoom: number;
  originAddress: string;
  destinationAddress: string;
  origin: { lat: any; lng: any };
  destination: { lat: any; lng: any };
  renderOptions: any;
  gettingDrivers: boolean;
  loading: boolean;
  requestData: any;
  reachableDrivers: any;
  userLocationMarkerAnimation: string;
  loadMarker: boolean;
  riderdistance: number;
  timeToPickup: string;
  start: any;
  end: any;
  destinationlatitude: number;
  destinationlongitude: number;
  riderLink: any;
  public tripDistance: number;
  public destinationDistanceInKm: number;
  public pickupDistance: number;
  pickups = [];
  tripSearch: boolean;
  today = new Date();
  todaysDataTime = '';
  greeting: string;
  showNoTripMessage: boolean;
  userPaymentData: UserPaymentToken;
  userPayment: boolean;
  showForm: boolean;
  allActiveTrips: ActiveTrips[];
  allTripsDestinationLat: any[] = [];
  allTripsDestinationLong: any[] = [];
  driverLocation: any;
  location: any;
  driverLocationsLong: any[] = [];
  driverLocationsLat: any[] = [];
  currentLongitude: any;
  currentLatitude: any;
  currentLocation: string;
  availableTrips: boolean;
  showInput: any;
  message: string;
  currentDate: Date;
  dateNow: string;
  emptyTrip: boolean;
  private subs = new SubSink();
  allAvailableTrips = [];
  showCurrenLocationInput: boolean;
  request: {
    currentLocationLongitude: any; currentLocationLatitude: any;
    riderDestinationLatitude: any; riderDestinationLongitude: any;
    userId: any; tripStatus: string;
  };
  allTrips: any;
  currentUser: any;
  selectedTrip: ActiveTrips;
  trips: ActiveTrips[];
  currentLocationCoord: { lat: any; lng: any; };
  tripEndLocation: google.maps.LatLng;
  riderEndLocation: google.maps.LatLng;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private authService: AuthenticateDataService,
    private router: Router,
    private mapService: MapBroadcastService,
    // tslint:disable-next-line: variable-name
    private _snackBar: MatSnackBar,
    private activeRider: ActiveRiderDataService,
    private activeTrip: ActiveTripDataService,
    private broadCastService: BroadcastService,
    private notificationService: NotificationsService,
    private locationService: LocationDataService
  ) {
    this.notificationService.intiateConnection();
    this.notificationService.angularFireMessenger();
    this.notificationService.requestPermision();
    this.notificationService.receiveMessage();
    this.notificationService.currentMessage.subscribe(res => {
    });
    this.setIntervalCall();
  }

  ngOnInit() {
    const buttonObject = {
      showButton: false,
      route: ''
    };
    this.store.dispatch(new ShowBackButton(buttonObject));
    this.store.dispatch(new ShowLeftNav(true));
    this.store.dispatch(new GetTrips());
    this.subs.add(
      this.currentUser$.subscribe(user => {
        this.currentUser = user;
      }),
      this.trips$.subscribe(res => {
        this.trips = res;
        this.getCurrentDateTime();
      }),
      this.selectedTrips$.subscribe(res => {
        this.selectedTrip = res;
      }),
      this.emptyTrip$.subscribe(res => {
        this.emptyTrip = res;
      }),
    );

    this.activeTripCheck();
    localStorage.removeItem('currentLocation');
    setTimeout(() => {
      this.getCurrentLocation();
    }, 3000);
    this.showForm = true;
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(param => {
        this.riderLink = param.riderLink;
        if (this.riderLink) {
          this.getPickupDirection();
        }
      });
    this.searchControl = new FormControl();
    this.zoom = 15;
    // this.getAllDriversLocations();
  }

  smoothMapPan() {

  }

  sideNavCheck() {
    if (!this.riderLink) {
      this.broadCastService.publishSideNavValue(true);
    } else {
      return;
    }
  }
  activeTripCheck() {
    const gettingDrivers = JSON.parse(localStorage.getItem('gettingDrivers'));
    const onGoingTrip = JSON.parse(localStorage.getItem('onGoingTrip'));
    if (!gettingDrivers) {
      return;
    } else if (gettingDrivers === false) {
      return;
    } else {
      this.router.navigate(['rider/bookSeat']);
    }
  }
  mapReading() {
    this.userLocationMarkerAnimation = 'BOUNCE';
  }

  setIntervalCall() {
    interval(30000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(x => {
        // this.broadCastCurrentLocation();
        this.getAllDriversLocations();
      });
  }

  getAllDriversLocations() {
    this.locationService
      .getAllLocations()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(loc => {
        this.driverLocation = loc.filter(r => r.userRole === 'Driver');
        this.driverLocation.forEach(element => {
          const long = Number(element.pickupLongitude);
          const lat = Number(element.pickupLatitude);
          this.driverLocationsLong = [...this.driverLocationsLong, long];
          this.driverLocationsLat = [...this.driverLocationsLat, lat];
        });
      });
  }

  getCurrentLocation() {
    const userLocation = JSON.parse(localStorage.getItem('currentLocation'));
    if (userLocation) {
      this.latitude = userLocation.lat;
      this.longitude = userLocation.lng;
    } else {
      this.mapService.getCurrentLocation();
      this.mapService.locationObject.subscribe(loc => {
        this.latitude = loc.lat;
        this.longitude = loc.lng;
        const currentLocation = { lat: this.latitude, lng: this.longitude };
        this.currentLocationCoord = currentLocation;
        localStorage.setItem('origin', JSON.stringify(currentLocation));
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: currentLocation }, result => {
          if (!result) {
            return;
          } else {
            this.currentLocation = result[0].formatted_address;
            this.originAddress = result[0].formatted_address;
          }
        });
      });
    }

  }
  getActiveTripsCordinates() {
    this.activeTrip
      .getAllActiveTrips()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.allActiveTrips = res.filter(x => x.driverTripStatus === 1);
        this.allActiveTrips.forEach(element => {
          const tripDestinationLat = Number(element.driverStartLatitude);
          const tripDestinationLong = Number(element.driverStartLongitude);
          this.allTripsDestinationLat = [
            ...this.allTripsDestinationLat,
            tripDestinationLat
          ];
          this.allTripsDestinationLong = [
            ...this.allTripsDestinationLong,
            tripDestinationLong
          ];
        });
      });
  }
  broadCastCurrentLocation() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userLocation = JSON.parse(localStorage.getItem('currentLocation'));
    if (this.riderLink) {
      return;
    } else {
      if (!userLocation) {
        this.mapService.getCurrentLocation();
        this.mapService.locationObject.subscribe(loc => {
          this.currentLatitude = loc.lat;
          this.currentLongitude = loc.lng;
        });
      } else {
        return;
      }
      this.locationService
        .getLocationsByUserId(this.currentUser.userId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(res => {
          if (!res) {
            this.createUserLocation();
            return;
          } else {
            this.updateUserLocation(this.currentUser.userId);
          }
        });
    }
  }

  createUserLocation() {
    const locationPayload = {
      userId: this.currentUser.userId,
      pickupLongitude: this.currentLongitude,
      pickupLatitude: this.currentLatitude,
      userRole: this.currentUser.role
    };
    this.locationService
      .create(locationPayload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => { });
  }
  updateUserLocation(id) {
    const locationPayload = {
      userId: id,
      pickupLongitude: this.currentLongitude,
      pickupLatitude: this.currentLatitude,
      userRole: this.currentUser.role
    };
    this.locationService
      .update(id, locationPayload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => { });
  }

  storeLocation() {
    this.mapService.storeLocation(this.originAddress, this.destinationAddress);
  }
  // getDestinationCordinates() {
  //   this.mapService.findDestination(this.destinationAddress);
  // }

  passDirection() {
    const cl = JSON.parse(localStorage.getItem('origin'));
    const origin = JSON.parse(localStorage.getItem('currentLocation'));
    const destination = JSON.parse(localStorage.getItem('destination'));
    setTimeout(() => {
      if (!origin) {
        this.getDirection(cl, destination);
      } else {
        this.getDirection(origin, destination);
      }
    }, 5000);
  }

  getDirection(origin, destination) {
    setTimeout(() => {
      this.loadMarker = false;
      this.gettingDrivers = true;
      this.showDirection = true;
      this.origin = { lat: origin.lat, lng: origin.lng };
      this.destination = { lat: destination.lat, lng: destination.lng };
      this.renderOptions = {
        suppressMarkers: true,

        polylineOptions: {
          strokeColor: '#e040fb',
          geodesic: true,
          strokeOpacity: 0.6,
          strokeWeight: 5,
          editable: false,
        },
      };
      this.latitude = origin.lat;
      this.longitude = origin.lng;
    }, 2000);


    //   this.heatmap = new google.maps.visualization.HeatmapLayer({
    //     data: [this.origin, this.destination]
    // });
    // this.waypoints = [
    //    {location: { lat: 39.0921167, lng: -94.8559005 }},
    //    {location: { lat: 41.8339037, lng: -87.8720468 }}
    // ]
  }

  getPickupDirection() {
    const activeRider = JSON.parse(localStorage.getItem('activeRiderRequest'));
    const origin = { lat: Number(activeRider.currentLocationLatitude), lng: Number(activeRider.currentLocationLongitude) };
    const destination = JSON.parse(localStorage.getItem('pickup'));
    this.getDirection(origin, destination);
  }
  getDrivers() {
    this.loadMarker = true;
    if (!this.userPayment) {
      localStorage.setItem('paymentType', 'cash');
    } else {
      localStorage.setItem('paymentType', 'card');
    }
    this.getCurrentLocation();
    this.gettingDrivers = true;
    this.showForm = false;
    this.loading = true;
    this.createTripRequest();
  }
  onAutocompleteSelected(result: PlaceResult) {
    this.store.dispatch(new GetTrips());
    this.destinationAddress = result.formatted_address;
    this.mapService.findDestination(this.destinationAddress);
  }

  onLocationSelected(location: Location) {
    this.destinationlatitude = location.latitude;
    this.destinationlongitude = location.longitude;
  }
  createTripRequest() {
    const status = 1;

    setTimeout(() => {
      const destination = JSON.parse(localStorage.getItem('destination'));
      const request = {
        currentLocationLongitude: this.longitude.toString(),
        currentLocationLatitude: this.latitude.toString(),
        riderDestinationLatitude: destination.lat.toString(),
        riderDestinationLongitude: destination.lng.toString(),
        userId: this.currentUser.id,
        tripStatus: '1'
      };
      localStorage.setItem('activeRiderRequest', JSON.stringify(request));
    }, 5000);

    this.getAllActiveTrips(status);

  }
  markerDragEnd(m: any, $event: any) { }
  milesToRadius(value) {
    this.circleRadius = value / 0.00062137;
  }

  circleRadiusInMiles() {
    return this.circleRadius * 0.00062137;
  }
  openSearchMessage() {
    this._snackBar.openFromComponent(SearchMessageComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['dark-snackbar-search']
    });
  }
  getCurrentDateTime() {
    this.currentDate = new Date();
    const currentDate = new Date().getTime();
    this.dateNow = formatDate(currentDate, ' h:mm a', 'en-US')
      .toLowerCase()
      .substring(1);
  }
  getAllActiveTrips(status?) {
    this.subs.add(
      this.trips$.subscribe(res => {
        this.allActiveTrips = res;
      }),
    );
    if (this.allActiveTrips.length < 1) {
      this.notificationService.showInfoMessage(
        'Sorry there are no trips at the moment. Please try again later.'
      );
      this.showNoTripMessage = true;
      this.showForm = false;
      this.emptyTrip = false;
      setTimeout(() => {
        this.loadMarker = false;
        this.showNoTripMessage = false;
        this.showForm = true;
        this.gettingDrivers = false;
      }, 10000);
    } else {
      const activeTrips = JSON.parse(JSON.stringify(this.allActiveTrips));
      activeTrips.forEach(element => {
        const tripDestinationLat = Number(element.driverEndLatitude);
        const tripDestinationLong = Number(element.driverEndLongitude);
        const pickupLat = Number(element.driverStartLatitude);
        const pickupLng = Number(element.driverStartLongitude);
        const origin = JSON.parse(localStorage.getItem('origin'));
        const userLocation = JSON.parse(
          localStorage.getItem('currentLocation')
        );
        const userDestination = JSON.parse(
          localStorage.getItem('destination')
        );
        this.tripEndLocation = new google.maps.LatLng(
          tripDestinationLat,
          tripDestinationLong
        );
        this.riderEndLocation = new google.maps.LatLng(
          userDestination.lat,
          userDestination.lng
        );
        new google.maps.DistanceMatrixService().getDistanceMatrix(
          {
            origins: [this.tripEndLocation],
            destinations: [this.riderEndLocation],
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (results: any) => {
            this.destinationDistanceInKm =
              results.rows[0].elements[0].distance.value / 1000;
            element.userDriverDestinationDistance = this.destinationDistanceInKm;
            // this.destinationDistanceInKm.push(destinationDistanceInKm);
          }
        );

        if (userLocation !== null) {
          this.start = userLocation;
        } else {
          this.start = origin;
        }
        const currentLocation = new google.maps.LatLng(
          this.start.lat,
          this.start.lng
        );
        const pickupLocation = new google.maps.LatLng(
          pickupLat,
          pickupLng
        );
        const request = {
          origin: pickupLocation,
          destination: this.tripEndLocation
        };
        localStorage.setItem('pickup', JSON.stringify(pickupLocation));
        this.getRoutePoints(request);
        new google.maps.DistanceMatrixService().getDistanceMatrix(
          {
            origins: [currentLocation],
            destinations: [pickupLocation],
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (results: any) => {
            element.pickupDistance =
              results.rows[0].elements[0].distance.value / 1000;
            element.timeToPickup =
              results.rows[0].elements[0].duration.text;


            this.allAvailableTrips = activeTrips.filter(d => d.pickupDistance < 8 &&
              d.userDriverDestinationDistance < 8 &&
              d.allowedRiderCount >= 0 && new Date(d.actualTripStartDateTime) >= this.currentDate);
            console.log(this.allAvailableTrips);
            if (this.allAvailableTrips.length < 1) {
              this.store.dispatch(new ShowLoader(false));
              this.loadMarker = false;
              // this.store.dispatch(new ShowEmptyTripMessage(true));
              this.emptyTrip = true;
              return;
            } else {
              // this.store.dispatch(new ShowEmptyTripMessage(false));
              this.store.dispatch(new GetAvailableTrips(this.allAvailableTrips));
              this.availableTrips = true;
              this.gettingDrivers = false;
              this.emptyTrip = false;
              this.passDirection();
            }
          }
        );
      });
    }


  }

  navToTripSearch() {
    this.loadMarker = false;
    this.reachableDrivers = false;
    this.emptyTrip = false;
    this.showForm = true;
    this.gettingDrivers = false;
    this.showNoTripMessage = false;
    this.availableTrips = false;
    this.showDirection = false;
    this.store.dispatch(new ShowEmptyTripMessage(this.emptyTrip));
    // this.broadCastService.publishEmptyTrips(this.emptyTrip);
    // this.origin = {lat: null, lng: null};
    // this.destination = {lat: null, lng: null};
    this.getCurrentLocation();
  }

  getRoutePoints(request: {}) {
    new google.maps.DirectionsService().route(request, results => {
      console.log('route points', results);
    });
  }

  storeUserCurrentLocation(result: PlaceResult) {
    this.map.usePanning = true;
    const userLocation = result.formatted_address;
    this.originAddress = userLocation;
    this.mapService.findOrigin(userLocation);
    this.map.triggerResize();
    setTimeout(() => {
      // this.showCurrenLocationInput = true;
      this.getCurrentLocation();
    }, 3000);
  }

  mapSmoothAnimation(destination) {
  }

  computeDistance(origin, destination) {
    new google.maps.DistanceMatrixService().getDistanceMatrix(
      {
        travelMode: google.maps.TravelMode.DRIVING,
        origins: [origin],
        destinations: [destination],
      },
      (results: any) => {
        this.tripDistance =
          results.rows[0].elements[0].distance.value / 1000 + 2;
        return this.tripDistance;
      }
    );
  }

  toggleInput() {
    this.showInput = !this.showInput;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subs.unsubscribe();

  }
}
