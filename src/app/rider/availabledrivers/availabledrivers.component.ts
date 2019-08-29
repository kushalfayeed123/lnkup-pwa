import { MapBroadcastService } from './../../services/business/mapbroadcast.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-availabledrivers',
  templateUrl: './availabledrivers.component.html',
  styleUrls: ['./availabledrivers.component.scss']
})
export class AvailabledriversComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  public config: any = {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    spaceBetween: 30
};
  availableTrips: any;
  emptyTrips: boolean;
  destinationLocation = [];
  availableSeats = [];

  constructor(private mapService: MapBroadcastService) { }

  ngOnInit() {
    this.getAvailableTrips();
  }

  getAvailableTrips() {
    localStorage.removeItem('userLocation');
    this.mapService.availableTrips
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(trips => {
      this.availableTrips = trips;
      if (this.availableTrips.length === 0) {
        this.emptyTrips = true;
        console.log('there no trips headed in your direction');
      }
      this.availableTrips.forEach(element => {
        const destinationLat = element.driverEndLatitude;
        const destinationLng = element.driverEndLongitude;
        const destinationLocation = {lat: destinationLat, lng: destinationLng};
        this.destinationLocation.push(destinationLocation);

        const maxSeats = element.maxRiderNumber;
        const allowedRiderCount = element.allowedRiderCount;
        const availableSeat =  maxSeats - allowedRiderCount;
        this.availableSeats.push(availableSeat);
      });
      this.mapService.getDesinationLocations(this.destinationLocation);
    });
  }

  getDriverDetails(tripId) {
      console.log(tripId);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
