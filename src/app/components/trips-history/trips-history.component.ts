import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { Select, Store } from '@ngxs/store';
import { AppState } from 'src/app/state/app/app.state';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { SubSink } from 'subsink/dist/subsink';
import { TripsState } from 'src/app/state/trip/trips.state';
import { GetAllTrips } from 'src/app/state/trip/trips.action';

@Component({
  selector: 'app-trips-history',
  templateUrl: './trips-history.component.html',
  styleUrls: ['./trips-history.component.scss']
})
export class TripsHistoryComponent implements OnInit, OnDestroy {

  @Select(AppState.getCurrentUser) currentUser$: Observable<Users>;
  @Select(TripsState.getAllTrips) allTrips$: Observable<ActiveTrips[]>;



  private unsubscribe$ = new Subject<void>();
  allTrips: any;
  loading: boolean;
  tripFees: ActiveTrips[];
  private subs = new SubSink();
  noTripMessage: string;


  constructor(private activeTrip: ActiveTripDataService, private store: Store) { }

  ngOnInit() {
    this.store.dispatch(new GetAllTrips());
    this.subs.add(this.currentUser$.subscribe(res => {
      this.getAllTrips(res);
    })
    );
  }


  getAllTrips(user) {
    this.subs.add(
      this.allTrips$.subscribe(res => {
        if (res) {
          if (user.role === 'Driver') {
            this.allTrips = res.filter(d => d.tripDriver.driverId === user.userId);
          } else {
            this.allTrips = res.filter(d => d.activeRiders.some(r => r.user.userId === user.userId));
          }
        } else {
          this.noTripMessage = 'You have not taken any trip yet.';
          return;
        }
      })
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subs.unsubscribe();
  }

}
