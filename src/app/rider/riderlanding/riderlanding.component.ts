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

  @ViewChild('search', { static: false }) searchElementRef: ElementRef;

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

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticateDataService,
    private router: Router,
    private mapService: MapBroadcastService,
    private _snackBar: MatSnackBar,
    private  activeRider: ActiveRiderDataService
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
    });

  }
  storeLocation() {
    this.mapService.storeLocation(this.originAddress, this.destinationAddress);
    setTimeout(() => {
      this.getDirection();
    }, 2000);
  }

  async getDirection() {
    const origin = await JSON.parse(localStorage.getItem('origin'));
    const destination = await JSON.parse(localStorage.getItem('destination'));
    console.log('direction', origin, destination);
    this.origin = { lat: origin.lat, lng: origin.lng };
    this.destination = { lat: destination.lat, lng: destination.lng };
    this.renderOptions = { polylineOptions: { strokeColor: '#d54ab6',
                                              geodesic : true,
                                              strokeOpacity: 0.6,
                                              strokeWeight: 5,
                                              editable: false, } };
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: [this.origin, this.destination]
  });
    // this.waypoints = [
    //    {location: { lat: 39.0921167, lng: -94.8559005 }},
    //    {location: { lat: 41.8339037, lng: -87.8720468 }}
    // ]
  }
  getDrivers() {
    this.gettingDrivers = true;
    this.loading = true;
    this.getCurrentLocation();
    this.openSearchMessage();
    this.createTripRequest();
  }
  createTripRequest() {
    const UserId = JSON.parse(localStorage.getItem('currentUser'));
    this.mapService.findDestination(this.destinationAddress);
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
      console.log(data);
     });
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
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
