import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  NgZone,
  ElementRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { MatSnackBar } from '@angular/material';
import { SearchMessageComponent } from 'src/app/components/search-message/search-message.component';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import {Location, Appearance} from '@angular-material-extensions/google-maps-autocomplete';
import PlaceResult = google.maps.places.PlaceResult;
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';


@Component({
  selector: 'app-riderlanding',
  templateUrl: './riderlanding.component.html',
  styleUrls: ['./riderlanding.component.scss']
})
export class RiderlandingComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public userId: string;
  public circleRadius = 70;
  public appearance = Appearance;
  private heatmap: google.maps.visualization.HeatmapLayer = null;

  @ViewChild('search', { static: true }) public searchElement: ElementRef;

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

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticateDataService,
    private router: Router,
    private mapService: MapBroadcastService,
    // tslint:disable-next-line: variable-name
    private _snackBar: MatSnackBar,
    private  activeRider: ActiveRiderDataService,
    private activeTrip: ActiveTripDataService,
    private broadCastService: BroadcastService,
    private notificationService: NotificationsService
  ) {
    // this.notificationService.intiateConnection();

  }

  ngOnInit() {
    // this.clearLocalStorage();
    this.route.queryParams
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(param => {
      this.riderLink = param.riderLink;
      this.tripSearch = param.tripSearch;
      if (this.riderLink) {
        this.getPickupDirection();
      }
    });
    console.log('trip search', this.tripSearch);
    localStorage.removeItem('userLocation');
    this.loadMarker = true;
    this.route.params.subscribe(p => {
      const userId = p.id;
      this.getUserById(userId);
    });
    this.searchControl = new FormControl();
    // this.getDirection();
    this.getCurrentLocation();
    this.zoom = 17;
    // this.location.marker.draggable = true;
  }
  getUserById(userId) {
    this.authService
      .getById(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        const currentUser = user;
        console.log('user viewing this screen', currentUser);
      });
  }
  mapReading() {
    this.userLocationMarkerAnimation = 'BOUNCE';
  }

  getCurrentLocation() {
    this.mapService.getCurrentLocation();
    const userLocation = localStorage.getItem('userLocation');
    if (userLocation !== null || !' ') {
      this.mapService.storeOrigin(userLocation);
      const userLoc = JSON.parse(localStorage.getItem('origin'));
      this.latitude = userLoc.lat;
      this.longitude =  userLoc.lng;
      console.log('user location', this.latitude, this.longitude);
    } else {
        this.mapService.locationObject.subscribe(loc => {
        this.latitude = loc.lat;
        this.longitude  = loc.lng;
        const currentLocation = {lat: loc.lat, lng: loc.lng};
        localStorage.setItem('origin', JSON.stringify(currentLocation));
      });
    }
  }
  storeLocation() {
    this.mapService.storeLocation(this.originAddress, this.destinationAddress);
    setTimeout(() => {
      this.passDirection();
    }, 2000);
  }
  getDestinationCordinates() {
    this.mapService.findDestination(this.destinationAddress);
  }

    passDirection() {
      setTimeout(() => {
        const cl = JSON.parse(localStorage.getItem('origin'));
        console.log('cl', cl);
        const destination = JSON.parse(localStorage.getItem('destination'));
        this.getDirection(cl, destination);
      }, 1000);
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
  //   this.heatmap = new google.maps.visualization.HeatmapLayer({
  //     data: [this.origin, this.destination]
  // });
    // this.waypoints = [
    //    {location: { lat: 39.0921167, lng: -94.8559005 }},
    //    {location: { lat: 41.8339037, lng: -87.8720468 }}
    // ]
  }

  getPickupDirection() {
    const origin = JSON.parse(localStorage.getItem('origin'));
    const pickupArray = JSON.parse(localStorage.getItem('pickup'));
    pickupArray.forEach(element => {
      const destination = element;
      console.log('get direction', origin, destination);
      this.getDirection(origin, destination);
    });
  }
  getDrivers() {
    this.loadMarker = false;
    this.getCurrentLocation();
    this.getDestinationCordinates();
    this.passDirection();
    this.gettingDrivers = true;
    this.loading = true;
    this.createTripRequest();
  }
  onAutocompleteSelected(result: PlaceResult) {
    console.log('onAutocompleteSelected: ', result.formatted_address);
    this.destinationAddress = result.formatted_address;
  }

  onLocationSelected(location: Location) {
    console.log('onLocationSelected: ', location);
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
      console.log(request);
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
  getAllActiveTrips(status?) {
    this.activeTrip.getAllActiveTrips(status)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      const allActiveTrips = data;
      allActiveTrips.forEach(element => {
        const tripDestinationLat = Number(element.driverEndLatitude);
        const tripDestinationLong = Number(element.driverEndLongitude);
        const userDestination = JSON.parse(localStorage.getItem('destination'));
        const tripEndLocation = new google.maps.LatLng(tripDestinationLat, tripDestinationLong);
        const riderEndLocation = new google.maps.LatLng(userDestination.lat, userDestination.lng);
        new google.maps.DistanceMatrixService().getDistanceMatrix({origins: [tripEndLocation], destinations: [riderEndLocation],
          travelMode: google.maps.TravelMode.DRIVING}, (results: any) => {
            this.destinationDistanceInKm =  (results.rows[0].elements[0].distance.value / 1000);
            element.userDriverDestinationDistance = this.destinationDistanceInKm;
          // this.destinationDistanceInKm.push(destinationDistanceInKm);
        });
        const pickupLat = Number(element.driverStartLatitude);
        const pickupLng = Number(element.driverStartLongitude);

        this.start = JSON.parse(localStorage.getItem('origin'));
        const currentLocation = new google.maps.LatLng(this.start.lat, this.start.lng);
        const pickupLocation = new google.maps.LatLng(pickupLat, pickupLng);
        localStorage.setItem('pickup', JSON.stringify(pickupLocation));
        new google.maps.DistanceMatrixService().getDistanceMatrix({origins: [currentLocation], destinations: [pickupLocation],
            travelMode: google.maps.TravelMode.DRIVING}, (results: any) => {
              this.pickupDistance =  (results.rows[0].elements[0].distance.value / 1000);
              console.log('pickup distance', results);
  
              const timeToPickup = (results.rows[0].elements[0].duration.text);
              this.timeToPickup = timeToPickup;
              element.timeToPickup = this.timeToPickup;
              element.pickupDistance = this.pickupDistance;
              console.log('distances', this.pickupDistance, this.destinationDistanceInKm);
              this.reachableDrivers = allActiveTrips.filter(d => d.driverTripStatus === 1 && d.pickupDistance < 8
                && d.userDriverDestinationDistance < 8);
              this.mapService.publishAvailableTrips(this.reachableDrivers);
              this.gettingDrivers = false;
              console.log('reachable drivers', this.reachableDrivers );
             });

      });
    });
  }

  storeUserCurrentLocation(result: PlaceResult) {
    const userLocation =  result.formatted_address;
    localStorage.setItem('userLocation', userLocation);
  }

  computeDistance(origin, destination) {
    new google.maps.DistanceMatrixService().getDistanceMatrix({origins: [origin], destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING}, (results: any) => {
     this.tripDistance =  (results.rows[0].elements[0].distance.value / 1000) + 2;
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


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
