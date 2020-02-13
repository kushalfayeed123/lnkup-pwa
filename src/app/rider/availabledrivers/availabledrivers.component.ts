import { MapBroadcastService } from './../../services/business/mapbroadcast.service';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { slideInAnimation } from 'src/app/services/misc/animation';

import { trigger, transition, useAnimation } from '@angular/animations';
import { bounce } from 'ng-animate';

@Component({
  selector: 'app-availabledrivers',
  templateUrl: './availabledrivers.component.html',
  styleUrls: ['./availabledrivers.component.scss'],
  animations: [trigger('bounce', [transition('* => *', useAnimation(bounce))]), slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class AvailabledriversComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  bounce: any;

  public config: any = {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    spaceBetween: 30
  };
  availableTrips: any;
  emptyTrip: boolean;
  destinationLocation = [];
  availableSeats = [];
  driverUserName = [];
  pickUp = [];
  pickupAddress: any;
  showTripDetails: boolean;
  currentDate: Date;
  dateNow: any;

  constructor(
    private mapService: MapBroadcastService,
    private broadcastService: BroadcastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.emptyTrip = false;
    this.broadcastService.showTripDetails
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.showTripDetails = data;
        this.getCurrentDateTime();
      });
    this.getAvailableTrips();
  }


  getCurrentDateTime() {
    this.currentDate = new Date();
    const currentDate = new Date().getTime();
    this.dateNow = formatDate(currentDate, ' h:mm a', 'en-US')
      .toLowerCase()
      .substring(1);
  }

  getAvailableTrips() {
    this.mapService.availableTrips
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(trips => {
        this.availableTrips = trips.filter(
          d =>
            d.pickupDistance < 8 &&
            d.userDriverDestinationDistance < 8 &&
            d.allowedRiderCount >= 0 &&
            new Date(d.actualTripStartDateTime) >= this.currentDate
        );
        if (this.availableTrips.length < 1) {
            this.emptyTrip = true;
            this.broadcastService.publishAllTrips(this.emptyTrip);
        } else {
          this.emptyTrip = false;
          this.availableTrips.forEach(element => {
            const userName = element.tripDriver;
            if (userName) {
              this.driverUserName.push(userName.driver.userName);
            } else {
              return;
            }
            const maxSeats = element.maxRiderNumber;
            const allowedRiderCount = element.allowedRiderCount;
            if (allowedRiderCount === 0) {
              const availableSeat = maxSeats;
              this.availableSeats.push(availableSeat);
            } else {
              const availableSeat = allowedRiderCount;
              this.availableSeats.push(availableSeat);
            }
          });
        }
      });
  }

  passTripDetails(userTripId) {
    this.mapService.publishTripDetails(userTripId);
    this.showTripDetails = true;
   }
  navToTripSearch() {
    // const user = JSON.parse(localStorage.getItem('currentUser'));
    // const userId = user.id;
    // this.clearLocalStorage();
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = 'reload';
    // this.router.navigate(['rider/home', userId]);
    this.showTripDetails = true;
  }

  clearLocalStorage() {
    localStorage.removeItem('paymentType');
    localStorage.removeItem('pickup');
    localStorage.removeItem('activeRiderRequest');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
