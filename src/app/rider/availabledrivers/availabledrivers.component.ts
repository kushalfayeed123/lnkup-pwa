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


  constructor(private mapService: MapBroadcastService) { }

  ngOnInit() {
    this.getAvailableTrips();
  }

  getAvailableTrips() {
    this.mapService.availableTrips
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(trips => {
      console.log('getting all the trips that are headed in the users direction', trips);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
