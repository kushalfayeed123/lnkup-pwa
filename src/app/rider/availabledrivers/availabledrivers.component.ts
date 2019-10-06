import { MapBroadcastService } from './../../services/business/mapbroadcast.service';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';

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
  driverUserName = [];
  pickUp  =  [];
  pickupAddress: any;
  showTripDetails: boolean;


  constructor(private mapService: MapBroadcastService, private broadcastService: BroadcastService) { }

  ngOnInit() {
    this.broadcastService.showTripDetails
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.showTripDetails = data;
    });
    this.getAvailableTrips();
  }

  getAvailableTrips() {
    this.mapService.availableTrips
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(trips => {
      this.availableTrips = trips;
      if (this.availableTrips.length === 0) {
        this.emptyTrips = true;
        console.log('there are no trips headed in your direction');
      }
      this.availableTrips.forEach(element => {
        const userName = element.tripDriver;
        if (userName) {
          this.driverUserName.push(userName.driver.userName);
          console.log(userName.driver.userName);
        } else {
          return;
        }
        const maxSeats = element.maxRiderNumber;
        const allowedRiderCount = element.allowedRiderCount;
        const availableSeat =  maxSeats - allowedRiderCount;
        this.availableSeats.push(availableSeat);
      });
    });
  }

  passTripDetails(userTripId) {
    this.mapService.publishTripDetails(userTripId);
    this.showTripDetails = true;
    console.log(this.showTripDetails);
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
