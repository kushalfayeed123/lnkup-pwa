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
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';

declare var google: any;



@Component({
  selector: 'app-riderlanding',
  templateUrl: './riderlanding.component.html',
  styleUrls: ['./riderlanding.component.scss']
})
export class RiderlandingComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public userId: string;
  public circleRadius = 50;

 
  @ViewChild('search', { static: false }) searchElementRef: ElementRef;

  searchControl: FormControl;
  lattitude: any;
  longitude: any;
  latitude: any;
  zoom: number;
  originAddress: string;
  destinationAddress: string;
  origin: { lat: any; lng: any; };
  destination: { lat: any; lng: any; };

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticateDataService,
    private router: Router,
    private mapService: MapBroadcastService
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
    // this.waypoints = [
    //    {location: { lat: 39.0921167, lng: -94.8559005 }},
    //    {location: { lat: 41.8339037, lng: -87.8720468 }}
    // ]
  }
  markerDragEnd(m: any, $event: any) {
  }
  milesToRadius(value) {
    this.circleRadius = value / 0.00062137;
  }

  circleRadiusInMiles() {
    return this.circleRadius * 0.00062137;
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
