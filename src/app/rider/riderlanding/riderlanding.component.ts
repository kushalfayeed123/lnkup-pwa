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
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { MatSnackBar } from '@angular/material';
import { SearchMessageComponent } from 'src/app/components/search-message/search-message.component';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { Location, Appearance } from '@angular-material-extensions/google-maps-autocomplete';
import PlaceResult = google.maps.places.PlaceResult;
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { UserPaymentToken } from 'src/app/models/payment';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { LocationDataService } from 'src/app/services/data/location/location.data.service';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { GoogleMapsScriptProtocol } from '@agm/core';


@Component({
  selector: 'app-riderlanding',
  templateUrl: './riderlanding.component.html',
  styleUrls: ['./riderlanding.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class RiderlandingComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public userId: string;
  public circleRadius = 70;
  public appearance = Appearance;
  private heatmap: google.maps.visualization.HeatmapLayer = null;

  @ViewChild('search', { static: true }) public searchElement: ElementRef;
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

  searchControl: FormControl;
  durationInSeconds = 10;
  longitude: any;
  latitude: any;
  zoom: number;
  originAddress: string;
  destinationAddress: string;
  origin: { lat: any; lng: any; };
  destination: { lat: any; lng: any; };
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

  constructor(
    private route: ActivatedRoute,
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
    // this.getAllTrips();
    this.notificationService.angularFireMessenger();
    // this.notificationService.deleteSubscription();
    this.notificationService.requestPermision();
    this.notificationService.receiveMessage();
    this.notificationService.currentMessage
      .subscribe(res => {
        // alert(res);
      });
    this.notificationService.tokenRefresh();
    this.setIntervalCall();

  }

  ngOnInit() {
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
    this.loadMarker = true;
    this.route.params.subscribe(p => {
      const userId = p.id;
      this.getUserById(userId);
    });
    this.searchControl = new FormControl();
    this.zoom = 15;
    this.notificationService.intiateConnection();
    this.getAllDriversLocations();
  }


  // getAllTrips() {
  //   this.activeTrip.getAllActiveTrips()
  //   .pipe(takeUntil(this.unsubscribe$))
  //   .subscribe(data => {
  //     this.broadCastService.publishALlTrips(data);
  //   });
  // }
  getUserById(userId) {
    this.authService
      .getById(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        const userPaymentData = user.userPaymentData;
        if (userPaymentData.length < 1) {
          this.userPayment = false;
        } else {
          this.userPayment = true;
        }
        this.broadCastService.publishUserPaymentStatus(this.userPayment);
      });
  }
  mapReading() {
    this.userLocationMarkerAnimation = 'BOUNCE';
  }

  setIntervalCall() {
    interval(30000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(x => {
        this.broadCastCurrentLocation();
        this.getAllDriversLocations();
      });
  }

  getAllDriversLocations() {
    this.locationService.getAllLocations()
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

 async getCurrentLocation() {
    window.scrollTo(0, 0);
    const userLocation = JSON.parse(localStorage.getItem('currentLocation'));
    if (userLocation !== null) {
      console.log('origin being used', userLocation);
      this.latitude = userLocation.lat;
      this.longitude = userLocation.lng;
    } else {
      this.mapService.getCurrentLocation();
      this.mapService.locationObject.subscribe(loc => {
        console.log('origin being used', loc);
        this.latitude = loc.lat;
        this.longitude = loc.lng;
        const currentLocation = { lat: loc.lat, lng: loc.lng };
        localStorage.setItem('origin', JSON.stringify(currentLocation));
        const geocoder = new google.maps.Geocoder;
        geocoder.geocode({ location: currentLocation }, (result) => {
          if (result[0]) {
            this.currentLocation = result[0].formatted_address;
            this.originAddress = result[0].formatted_address;
          } else {
            console.log('no results found');
          }
        });
      });

    }

  }
  getActiveTripsCordinates() {
    this.activeTrip.getAllActiveTrips()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.allActiveTrips = res.filter(x => x.driverTripStatus === 1);
        this.allActiveTrips.forEach(element => {
          const tripDestinationLat = Number(element.driverStartLatitude);
          const tripDestinationLong = Number(element.driverStartLongitude);
          this.allTripsDestinationLat = [...this.allTripsDestinationLat, tripDestinationLat];
          this.allTripsDestinationLong = [...this.allTripsDestinationLong, tripDestinationLong];
        });
      });
  }
  broadCastCurrentLocation() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userLocation = JSON.parse(localStorage.getItem('currentLocation'));
    if (!userLocation) {
      this.mapService.getCurrentLocation();
      this.mapService.locationObject.subscribe(loc => {
        this.currentLatitude = loc.lat;
        this.currentLongitude = loc.lng;
      });
    } else {
      return;
    }
    this.locationService.getLocationsByUserId(user.id)
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
      pickupLongitude: this.currentLongitude,
      pickupLatitude: this.currentLatitude,
      userRole: user.role
    };
    this.locationService.create(locationPayload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
      });
  }
  updateUserLocation(id) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const locationPayload = {
      userId: user.id,
      pickupLongitude: this.currentLongitude,
      pickupLatitude: this.currentLatitude,
      userRole: user.role
    };
    this.locationService.update(id, locationPayload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
      });
  }

  storeLocation() {
    this.mapService.storeLocation(this.originAddress, this.destinationAddress);
    setTimeout(() => {
    }, 2000);
  }
  getDestinationCordinates() {
    this.mapService.findDestination(this.destinationAddress);
  }

  passDirection() {
    setTimeout(() => {
      const cl = JSON.parse(localStorage.getItem('origin'));
      const origin = JSON.parse(localStorage.getItem('currentLocation'));
      const destination = JSON.parse(localStorage.getItem('destination'));
      if (origin !== null) {
        this.getDirection(origin, destination);
      } else {
        this.getDirection(cl, destination);

      }
    }, 1000);
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
          editable: false,
        }
      };
      this.latitude = cl.lat;
      this.longitude = cl.lng;
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
    const origin = JSON.parse(localStorage.getItem('currentLocation'));
    const pickupArray = JSON.parse(localStorage.getItem('pickup'));
    pickupArray.forEach(element => {
      const destination = element;
      console.log('get direction', origin, destination);
      this.getDirection(origin, destination);
    });
  }
  getDrivers() {
    if (!this.userPayment) {
      // this.notificationService.showInfoMessage('Please pay cash to your driver when this trip ends.');
      localStorage.setItem('paymentType', 'cash');
    } else {
      localStorage.setItem('paymentType', 'card');
    }
    this.loadMarker = false;
    this.getCurrentLocation();
    this.getDestinationCordinates();
    this.gettingDrivers = true;
    this.showForm = false;
    this.loading = true;
    this.createTripRequest();

  }
  onAutocompleteSelected(result: PlaceResult) {
    this.destinationAddress = result.formatted_address;
  }

  onLocationSelected(location: Location) {
    this.destinationlatitude = location.latitude;
    this.destinationlongitude = location.longitude;
  }
  createTripRequest() {
    const UserId = JSON.parse(localStorage.getItem('currentUser'));
    const status = 1;
    this.getAllActiveTrips(status);
    setTimeout(() => {
      const destination = JSON.parse(localStorage.getItem('destination'));
      const request = {
        currentLocationLongitude: this.longitude.toString(),
        currentLocationLatitude: this.latitude.toString(),
        riderDestinationLatitude: destination.lat.toString(),
        riderDestinationLongitude: destination.lng.toString(),
        userId: UserId.id,
        tripStatus: '1'
      };
      localStorage.setItem('activeRiderRequest', JSON.stringify(request));
    }, 2000);
  }
  markerDragEnd(m: any, $event: any) {
  }
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
  async getAllActiveTrips(status?) {
    const userId = JSON.parse(localStorage.getItem('currentUser'));
    this.activeTrip.getAllActiveTrips()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        const allActiveTrips = data;
        if (data.length === 0) {
          this.notificationService.showInfoMessage('Sorry there are no trips at the moment. Please try again later.');
          this.showNoTripMessage = true;
          this.showForm = false;
          setTimeout(() => {
            this.showNoTripMessage = false;
            this.showForm = true;
            this.gettingDrivers = false;
          }, 5000);
        } else {
          this.passDirection();
        }
        allActiveTrips.forEach(element => {
          const tripDestinationLat = Number(element.driverEndLatitude);
          const tripDestinationLong = Number(element.driverEndLongitude);
          const userDestination = JSON.parse(localStorage.getItem('destination'));
          const tripEndLocation = new google.maps.LatLng(tripDestinationLat, tripDestinationLong);
          const riderEndLocation = new google.maps.LatLng(userDestination.lat, userDestination.lng);
          new google.maps.DistanceMatrixService().getDistanceMatrix({
            origins: [tripEndLocation], destinations: [riderEndLocation],
            travelMode: google.maps.TravelMode.DRIVING
          }, (results: any) => {
            this.destinationDistanceInKm = (results.rows[0].elements[0].distance.value / 1000);
            element.userDriverDestinationDistance = this.destinationDistanceInKm;
            // this.destinationDistanceInKm.push(destinationDistanceInKm);
          });
          const pickupLat = Number(element.driverStartLatitude);
          const pickupLng = Number(element.driverStartLongitude);
          const origin = JSON.parse(localStorage.getItem('origin'));
          const userLocation = JSON.parse(localStorage.getItem('currentLocation'));
          if (userLocation !== null) {
            this.start = userLocation;
          } else {
            this.start = origin;
          }
          const currentLocation = new google.maps.LatLng(this.start.lat, this.start.lng);
          const pickupLocation = new google.maps.LatLng(pickupLat, pickupLng);
          const request = {
            origin: pickupLocation,
            destination: tripEndLocation,
          };
          localStorage.setItem('pickup', JSON.stringify(pickupLocation));
          this.getRoutePoints(request);
          new google.maps.DistanceMatrixService().getDistanceMatrix({
            origins: [currentLocation], destinations: [pickupLocation],
            travelMode: google.maps.TravelMode.DRIVING
          }, (results: any) => {
            this.pickupDistance = (results.rows[0].elements[0].distance.value / 1000);
            const timeToPickup = (results.rows[0].elements[0].duration.text);
            this.timeToPickup = timeToPickup;
            element.timeToPickup = this.timeToPickup;
            element.pickupDistance = this.pickupDistance;
            if (!allActiveTrips) {
              return;
            } else {
              this.reachableDrivers = allActiveTrips;
              this.availableTrips = true;
              this.mapService.publishAvailableTrips(this.reachableDrivers);
              this.gettingDrivers = false;
            }
          });
        });
      });

  }

  getRoutePoints(request: {}) {
    new google.maps.DirectionsService().route(request, (results) => {
      console.log('route points', results);
    });
  }

  storeUserCurrentLocation(result: PlaceResult) {
    const userLocation = result.formatted_address;
    this.originAddress = userLocation;
    this.mapService.findOrigin(userLocation);
    setTimeout(() => {
      this.getCurrentLocation();
    }, 3000);

  }

  computeDistance(origin, destination) {
    new google.maps.DistanceMatrixService().getDistanceMatrix({
      origins: [origin], destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING
    }, (results: any) => {
      this.tripDistance = (results.rows[0].elements[0].distance.value / 1000) + 2;
      return this.tripDistance;
    });
  }

  clearLocalStorage() {
    localStorage.removeItem('tripDetails');
    localStorage.removeItem('origin');
    localStorage.removeItem('storedAddress');
    localStorage.removeItem('riderRequest');
    localStorage.removeItem('pickup');
    localStorage.removeItem('activeRiderRequest');
    localStorage.removeItem('destination');
  }

  toggleInput() {
    this.showInput = !this.showInput;
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}


