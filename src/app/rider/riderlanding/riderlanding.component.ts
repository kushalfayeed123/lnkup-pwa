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
  lattitude: any;
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
  timeToPickup: number;
  start: any;
  end: any;
  destinationlatitude: number;
  destinationlongitude: number;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticateDataService,
    private router: Router,
    private mapService: MapBroadcastService,
    // tslint:disable-next-line: variable-name
    private _snackBar: MatSnackBar,
    private  activeRider: ActiveRiderDataService,
    private activeTrip: ActiveTripDataService,
  ) { }

  ngOnInit() {
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

  async getCurrentLocation() {
    this.mapService.getCurrentLocation();
    const userLocation = localStorage.getItem('userLocation');
    if (userLocation !== null || !' ') {
      this.mapService.storeOrigin(userLocation);
      console.log('user location', this.latitude, this.longitude);
    } else {
      await this.mapService.locationObject.subscribe(loc => {
        this.latitude = loc.lat;
        this.longitude  = loc.lng;
        const currentLocation = {lat: loc.lat, lng: loc.lng};
        localStorage.setItem('currentLocation', JSON.stringify(currentLocation));
      });
    }
  }
  storeLocation() {
    this.mapService.storeLocation(this.originAddress, this.destinationAddress);
    setTimeout(() => {
      this.getDirection();
    }, 2000);
  }
  getDestinationCordinates() {
    this.mapService.findDestination(this.destinationAddress);
  }

    getDirection() {
    setTimeout(() => {
      const cl = JSON.parse(localStorage.getItem('currentLocation'));
      const origin = JSON.parse(localStorage.getItem('origin'));
      const destination = JSON.parse(localStorage.getItem('destination'));
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
  getDrivers() {
    this.loadMarker = false;
    this.getCurrentLocation();
    this.getDestinationCordinates();
    this.getDirection();
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
    this.mapService.findDestination(this.destinationAddress);
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
      this.activeRider.create(request)
     .pipe(takeUntil(this.unsubscribe$))
     .subscribe(data => {
       this.requestData = data;
       console.log('getting user request desination', this.requestData);
       const status = 1;
       this.getAllActiveTrips(status);
     });
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
      this.mapService.findAddressByCoordinates();
      allActiveTrips.forEach(element => {
        const tripDestinationLat = element.driverEndLatitude;
        const tripDestinationLong = element.driverEndLongitude;
        const userDestination = JSON.parse(localStorage.getItem('destination'));
        const startLocation = new google.maps.LatLng(tripDestinationLat, tripDestinationLong);
        const endLocation = new google.maps.LatLng(userDestination.lat, userDestination.lng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(startLocation, endLocation);
        const destinationDistanceInKm = distance / 1000;
        element.userDriverDestinationDistance = destinationDistanceInKm;
        const tripPickup = element.tripPickup;
        this.mapService.findLocation(tripPickup);
        this.start = JSON.parse(localStorage.getItem('currentLocation'));
        this.end = JSON.parse(localStorage.getItem('pickup'));
        // console.log('distance between trip destination and user destination in km', element.userDriverDestinationDistance, element);
      });
      this.end.forEach(data => {
        const currentLocation = new google.maps.LatLng(this.start.lat, this.start.lng);
        const pickupEndLocation = new google.maps.LatLng(data.lat, data.lng);
        this.riderdistance = google.maps.geometry.spherical.computeDistanceBetween(currentLocation, pickupEndLocation);
        const pickupDistanceInKm = Math.round(this.riderdistance / 1000);
        // const walkingDistancePerHour = 5 * 1000;
        // const timeToPickup = pickupDistanceInKm  / walkingDistancePerHour;
        // const timeToPickupInMinutes = timeToPickup;
        // this.timeToPickup = timeToPickupInMinutes * 60;
        console.log('pickup time in minutes', pickupDistanceInKm);
      });
      this.reachableDrivers = allActiveTrips.filter(d => d.userDriverDestinationDistance <= 10);
      this.mapService.publishAvailableTrips(this.reachableDrivers);
      this.gettingDrivers = false;
      console.log('reachable drivers', this.reachableDrivers);
    });
  }

  storeUserCurrentLocation(result: PlaceResult) {
    const userLocation =  result.formatted_address;
    localStorage.setItem('userLocation', userLocation);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
