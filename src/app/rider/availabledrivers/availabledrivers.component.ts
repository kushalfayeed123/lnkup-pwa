import { MapBroadcastService } from './../../services/business/mapbroadcast.service';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { slideInAnimation } from 'src/app/services/misc/animation';

import { trigger, transition, useAnimation } from '@angular/animations';
import { bounce } from 'ng-animate';
import { Select } from '@ngxs/store';
import { TripsState } from 'src/app/state/trip/trips.state';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { SubSink } from 'subsink/dist/subsink';

@Component({
  selector: 'app-availabledrivers',
  templateUrl: './availabledrivers.component.html',
  styleUrls: ['./availabledrivers.component.scss'],
  animations: [trigger('bounce', [transition('* => *', useAnimation(bounce))]), slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class AvailabledriversComponent implements OnInit, OnDestroy {

  @Select(TripsState.getAvailableTrips) trips$: Observable<ActiveTrips[]>;

  private unsubscribe$ = new Subject<void>();
  private subs = new SubSink();

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
  ) { }

  ngOnInit() {
    this.subs.add(
      this.trips$.subscribe(res => {
        this.availableTrips = res;
      })
    );
    this.broadcastService.showTripDetails
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.showTripDetails = data;
      });
    this.getAvailableTrips();
  }



  getAvailableTrips() {
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

  passTripDetails(userTripId) {
    this.mapService.publishTripDetails(userTripId);
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
