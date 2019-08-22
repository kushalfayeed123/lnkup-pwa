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
import { Appearance } from '@angular-material-extensions/google-maps-autocomplete';

declare var google: any;

interface Marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}

interface Location {
  lat: number;
  lng: number;
  viewport?: object;
  zoom: number;
  address_level_1?: string;
  address_level_2?: string;
  origin_address?: string;
  destination_address?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  marker?: Marker;
}

@Component({
  selector: 'app-riderlanding',
  templateUrl: './riderlanding.component.html',
  styleUrls: ['./riderlanding.component.scss']
})
export class RiderlandingComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public userId: string;
  public circleRadius = 50;
  public geocoder: any;
  public location: Location = {
    lat: 51.678418,
    lng: 7.809007,
    marker: {
      lat: 51.678418,
      lng: 7.809007,
      draggable: true
    },
    zoom: 17
  };
  public appearance = Appearance;

  @ViewChild(AgmMap, { static: false }) map: AgmMap;
  @ViewChild('search', { static: false }) search: ElementRef;

  origin: { lat: number; lng: number; };
  destination: { lat: number; lng: number; };
  waypoints: { location: { lat: number; lng: number; }; }[];
  searchControl: FormControl;
  latitude: number;
  longitude: number;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticateDataService,
    private router: Router,
    public mapsApiLoader: MapsAPILoader,
    private zone: NgZone,
    private wrapper: GoogleMapsAPIWrapper
  ) {
    this.mapsApiLoader = mapsApiLoader;
    this.zone = zone;
    this.wrapper = wrapper;
    this.mapsApiLoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
    });
  }

  ngOnInit() {
    this.route.params.subscribe(p => {
      const userId = p.id;
      this.getUserById(userId);
    });
    this.searchControl = new FormControl();
    // this.getDirection();
    this.getCurrentLocation();
    this.location.marker.draggable = true;
  }



  onLocationSelected(location: Location) {
    console.log('onLocationSelected: ', location);
    this.latitude = location.lat;
    this.longitude = location.lng;
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
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.showTrackingPosition(pos);
      });
    }
  }

  async getDirection(){
    const origin = await JSON.parse(localStorage.getItem('origin'));
    const destination =  await JSON.parse(localStorage.getItem('destination'));
    console.log('direction', origin, destination);
    this.origin = { lat: origin.lat, lng: origin.lng }
    this.destination = { lat: destination.lat, lng: destination.lng }
  // this.waypoints = [
  //    {location: { lat: 39.0921167, lng: -94.8559005 }},
  //    {location: { lat: 41.8339037, lng: -87.8720468 }}
  // ]
  }

  showTrackingPosition(position) {
    this.location.lng = position.coords.longitude;
    this.location.lat = position.coords.latitude;
    console.log('getting my location',  typeof this.location.lng);
  }

  // updateOnMap() {
  //   // tslint:disable-next-line:variable-name
  //   let full_address: string = this.location.address_level_1 || ' ';
  //   if (this.location.address_level_2) {
  //     full_address = full_address + ' ' + this.location.address_level_2;
  //   }
  //   if (this.location.address_state) {
  //     full_address = full_address + ' ' + this.location.address_state;
  //   }
  //   if (this.location.address_country) {
  //     full_address = full_address + ' ' + this.location.address_country;
  //   }

  //   this.findLocation(full_address);
  // }
  storeLocation(){
    let origin_address: string = this.location.origin_address || ' ';
    let destination_address: string = this.location.destination_address || '';
    this.findOrigin(origin_address);
    this.findDestination(destination_address);
    setTimeout(() => {
      this.getDirection();
    }, 2000);

  }

  findDestination(address) {
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }
    this.geocoder.geocode(
      {
        address
      },
      (results, status) => {
        console.log(results);
        if (status === google.maps.GeocoderStatus.OK) {
          // tslint:disable-next-line:prefer-for-of
          for (var i = 0; i < results[0].address_components.length; i++) {
            const types = results[0].address_components[i].types;

            if (types.indexOf('locality') !== -1) {
              this.location.address_level_2 =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('country') !== -1) {
              this.location.address_country =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('postal_code') !== -1) {
              this.location.address_zip =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('administrative_area_level_1') !== -1) {
              this.location.address_state =
                results[0].address_components[i].long_name;
            }
          }

          if (results[0].geometry.location) {
            this.location.lat = results[0].geometry.location.lat();
            this.location.lng = results[0].geometry.location.lng();
            // this.location.marker.lat = results[0].geometry.location.lat();
            // this.location.marker.lng = results[0].geometry.location.lng();
            // this.location.marker.draggable = true;
            // this.location.viewport = results[0].geometry.viewport;
            const destination = {lng: this.location.lng,
                            lat: this.location.lat}
            localStorage.setItem('destination', JSON.stringify(destination));
            console.log('coordinates', this.location.lat, this.location.lng);
          }

          // this.map.triggerResize();
        } else {
          alert('Sorry, this search produced no results.');
        }
      }
    );
  }
   findOrigin(address){
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }
    this.geocoder.geocode(
      {
        address
      },
      (results, status) => {
        console.log(results);
        if (status === google.maps.GeocoderStatus.OK) {
          // tslint:disable-next-line:prefer-for-of
          for (var i = 0; i < results[0].address_components.length; i++) {
            const types = results[0].address_components[i].types;

            if (types.indexOf('locality') !== -1) {
              this.location.address_level_2 =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('country') !== -1) {
              this.location.address_country =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('postal_code') !== -1) {
              this.location.address_zip =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('administrative_area_level_1') !== -1) {
              this.location.address_state =
                results[0].address_components[i].long_name;
            }
          }

          if (results[0].geometry.location) {
            this.location.lat = results[0].geometry.location.lat();
            this.location.lng = results[0].geometry.location.lng();
            // this.location.marker.lat = results[0].geometry.location.lat();
            // this.location.marker.lng = results[0].geometry.location.lng();
            // this.location.marker.draggable = true;
            // this.location.viewport = results[0].geometry.viewport;
            const origin = {lng: this.location.lng,
                            lat: this.location.lat};
             localStorage.setItem('origin', JSON.stringify(origin));
          }

          // this.map.triggerResize();
        } else {
          alert('Sorry, this search produced no results.');
        }
      }
    );
  }
  findLocation(address){
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }
    this.geocoder.geocode(
      {
        address
      },
      (results, status) => {
        console.log(results);
        if (status === google.maps.GeocoderStatus.OK) {
          // tslint:disable-next-line:prefer-for-of
          for (var i = 0; i < results[0].address_components.length; i++) {
            const types = results[0].address_components[i].types;

            if (types.indexOf('locality') !== -1) {
              this.location.address_level_2 =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('country') !== -1) {
              this.location.address_country =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('postal_code') !== -1) {
              this.location.address_zip =
                results[0].address_components[i].long_name;
            }
            if (types.indexOf('administrative_area_level_1') !== -1) {
              this.location.address_state =
                results[0].address_components[i].long_name;
            }
          }

          if (results[0].geometry.location) {
            this.location.lat = results[0].geometry.location.lat();
            this.location.lng = results[0].geometry.location.lng();
            this.location.marker.lat = results[0].geometry.location.lat();
            this.location.marker.lng = results[0].geometry.location.lng();
            this.location.marker.draggable = true;
            this.location.viewport = results[0].geometry.viewport;
          }

          this.map.triggerResize();
        } else {
          alert('Sorry, this search produced no results.');
        }
      }
    );
  }
  markerDragEnd(m: any, $event: any) {
    this.location.marker.lat = m.coords.lat;
    this.location.marker.lng = m.coords.lng;
    this.findAddressByCoordinates();
  }
  findAddressByCoordinates() {
    this.geocoder.geocode(
      {
        location: {
          lat: this.location.marker.lat,
          lng: this.location.marker.lng
        }
      },
      (results, status) => {
        this.decomposeAddressComponents(results);
      }
    );
  }
  decomposeAddressComponents(addressArray) {
    if (addressArray.length === 0) {
      return false;
    }
    const address = addressArray[0].address_components;

    for (const element of address) {
      if (element.length === 0 && !element.types) {
        continue;
      }

      if (element.types.indexOf('street_number') > -1) {
        this.location.address_level_1 = element.long_name;
        continue;
      }
      if (element.types.indexOf('route') > -1) {
        this.location.address_level_1 += ', ' + element.long_name;
        continue;
      }
      if (element.types.indexOf('locality') > -1) {
        this.location.address_level_2 = element.long_name;
        continue;
      }
      if (element.types.indexOf('administrative_area_level_1') > -1) {
        this.location.address_state = element.long_name;
        continue;
      }
      if (element.types.indexOf('country') > -1) {
        this.location.address_country = element.long_name;
        continue;
      }
      if (element.types.indexOf('postal_code') > -1) {
        this.location.address_zip = element.long_name;
        continue;
      }
    }
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
