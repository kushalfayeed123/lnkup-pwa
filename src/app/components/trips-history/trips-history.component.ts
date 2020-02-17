import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { ActiveTrips } from 'src/app/models/ActiveTrips';

@Component({
  selector: 'app-trips-history',
  templateUrl: './trips-history.component.html',
  styleUrls: ['./trips-history.component.scss']
})
export class TripsHistoryComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  allTrips: any;
  loading: boolean;
  tripFees: ActiveTrips[];


  constructor(private activeTrip: ActiveTripDataService) { }

  ngOnInit() {
    this.getAllTrips();
  }


  getAllTrips() {
    this.loading = true;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.activeTrip
      .getAllTrips()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res) {
          this.loading = false;
          if (user.role === 'Driver') {
            this.allTrips = res.filter(d => d.tripDriver.driverId === user.id);
          } else {
            this.allTrips = res.filter(d => d.activeRiders.some(r => r.user.userId === user.id));
          }
        } else {
          return;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
