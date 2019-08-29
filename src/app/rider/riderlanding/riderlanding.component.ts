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
import { Appearance } from '@angular-material-extensions/google-maps-autocomplete';
import { MatSnackBar } from '@angular/material';
import { SearchMessageComponent } from 'src/app/components/search-message/search-message.component';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { MapsAPILoader } from '@agm/core';


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

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticateDataService,
    private router: Router,
    private mapService: MapBroadcastService,
    private _snackBar: MatSnackBar,
    private  activeRider: ActiveRiderDataService,
    private activeTrip: ActiveTripDataService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
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

  // autoCompleteFocus() {
  //   this.mapsAPILoader.load().then(
  //     () => {
  //      const autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, { types: ['address'] });

  //      autocomplete.addListener('place_changed', () => {
  //       this.ngZone.run(() => {
  //        const place: google.maps.places.PlaceResult = autocomplete.getPlace();
  //        if (place.geometry === undefined || place.geometry === null ) {
  //         return;
  //        }
  //       });
  //       });
  //     }
  //   );
  // }

  navtologin() {
    this.router.navigate(['auth']);
  }
  navtoregister() {
    this.router.navigate(['register']);
  }
  async getCurrentLocation() {
    await this.mapService.locationObject.subscribe(loc => {
      this.latitude = loc.lat;
      this.longitude  = loc.lng;
      const currentLocation = {lat: loc.lat, lng: loc.lng};
      localStorage.setItem('currentLocation', JSON.stringify(currentLocation));
    });

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
    this.getCurrentLocation();
    this.getDestinationCordinates();
    this.getDirection();
    this.gettingDrivers = true;
    this.loading = true;
    this.getCurrentLocation();
    this.openSearchMessage();
    this.createTripRequest();
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
      allActiveTrips.forEach(element => {
        const tripDestinationLat = element.driverEndLatitude;
        const tripDestinationLong = element.driverEndLongitude;
        const userDestination = JSON.parse(localStorage.getItem('destination'));
        const startLocation = new google.maps.LatLng(tripDestinationLat, tripDestinationLong);
        const endLocation = new google.maps.LatLng(userDestination.lat, userDestination.lng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(startLocation, endLocation);
        const destinationDistanceInKm = distance / 1000;
        element.userDriverDestinationDistance = destinationDistanceInKm;
        // console.log('distance between trip destination and user destination in km', element.userDriverDestinationDistance, element);
      });
      this.reachableDrivers = allActiveTrips.filter(d => d.userDriverDestinationDistance <= 5);
      this.mapService.publishAvailableTrips(this.reachableDrivers);
      console.log('reachable drivers', this.reachableDrivers);
    });
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
