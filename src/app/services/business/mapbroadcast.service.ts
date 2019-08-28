import { Injectable, NgZone, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';
import { Location } from '../../models/Location';

@Injectable()
export class MapBroadcastService {

  // tslint:disable-next-line: variable-name
  private _locationDistance = new BehaviorSubject(null);
  public locationDistance = this._locationDistance.asObservable();

  private _availableTrips = new BehaviorSubject(null);
  public availableTrips = this._availableTrips.asObservable();

  @ViewChild(AgmMap, { static: false }) map: AgmMap;

  public geocoder: any;



  // tslint:disable-next-line: variable-name
  private _location = new BehaviorSubject<any>({});
  public locationObject = this._location.asObservable();

  origin: { lat: number; lng: number; };
  destination: { lat: number; lng: number; };
  waypoints: { location: { lat: number; lng: number; }; }[];

  public location: Location = {
    lat: null,
    lng: null,
    marker: {
      lat: null,
      lng: null,
      draggable: true
    },
    zoom: 17
  };

  constructor(public mapsApiLoader: MapsAPILoader,
              private zone: NgZone,
              private wrapper: GoogleMapsAPIWrapper) {
    this.mapsApiLoader = mapsApiLoader;
    this.zone = zone;
    this.wrapper = wrapper;
    this.mapsApiLoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
    });

    this.getCurrentLocation();
  }


  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.showTrackingPosition(pos);
      });
    }
  }

  showTrackingPosition(position) {
    this.location.lng = position.coords.longitude;
    this.location.lat = position.coords.latitude;
    const location = {lat: this.location.lat, lng: this.location.lng};
    this._location.next(location);
    console.log('getting my location', typeof this.location.lng);
  }

  storeLocation(originaddress: string, destinationaddress: string) {
    console.log(originaddress, destinationaddress);
    originaddress = originaddress || ' ';
    destinationaddress = destinationaddress || '';
    this.findOrigin(originaddress);
    this.findDestination(destinationaddress);
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
          for (let i = 0; i < results[0].address_components.length; i++) {
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
            const destination = {
              lng: this.location.lng,
              lat: this.location.lat
            };
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
  findOrigin(address) {
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
          for (let i = 0; i < results[0].address_components.length; i++) {
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
            const origin = {
              lng: this.location.lng,
              lat: this.location.lat
            };
            localStorage.setItem('origin', JSON.stringify(origin));
          }

          // this.map.triggerResize();
        } else {
          alert('Sorry, this search produced no results.');
        }
      }
    );
  }
  findLocation(address) {
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
          for (let i = 0; i < results[0].address_components.length; i++) {
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

  publishAvailableTrips(availableTrips: []) {
    this._availableTrips.next(availableTrips);
  }

  // getLocationDistance(startLat, endLat, startLong, endLong) {
  //   const startLocation = new google.maps.LatLng(startLat, startLong);
  //   const endLocation = new google.maps.LatLng(endLat, endLong);
  //   const distance = google.maps.geometry.spherical.computeDistanceBetween(startLocation, endLocation);
  //   localStorage.setItem('locationDistance', JSON.stringify(distance));
  // }

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

  // activateAutocomplete(){
  //   this.mapsApiLoader.load().then(() => {
  //     const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
  //       types: ["address"]
  //     });

  //     autocomplete.addListener("place_changed", () => {
  //       this.zone.run(() => {
  //         //get the place result
  //         let place: google.maps.places.PlaceResult = autocomplete.getPlace();

  //         //verify result
  //         if (place.geometry === undefined || place.geometry === null) {
  //           return;
  //         }
  //       });
  //     });
  //   });
  // }

}
