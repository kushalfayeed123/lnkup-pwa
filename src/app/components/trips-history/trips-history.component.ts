import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-trips-history',
  templateUrl: './trips-history.component.html',
  styleUrls: ['./trips-history.component.scss']
})
export class TripsHistoryComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  allTrips: any;
  loading: boolean;


  constructor(private broadcastService: BroadcastService) { }

  ngOnInit() {
    this.getAllTrips();
  }


  getAllTrips() {
    this.loading = true;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.broadcastService.allTrips
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res) {
          this.loading = false;
          if (user.role === 'Driver') {
            this.allTrips = res.filter(d => d.tripDriver.driverId === user.id);
          } else {
            this.allTrips = res.filter(d => d.activeRiders.filter(r => r.user.userId === user.id));
            console.log('all trips', this.allTrips);
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
