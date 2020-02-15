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


  constructor(private broadcastService: BroadcastService) { }

  ngOnInit() {
    this.getAllTrips();
  }


  getAllTrips() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.broadcastService.allTrips
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res) {
          if (user.role === 'Driver') {
            this.allTrips = res.filter(d => d.tripDriver.driverId === user.id);
            console.log('all trips', this.allTrips);

          } else {
            // this.allTrips = res.filter(d => d.activeRiders.filter(r => r.user.userId === user.id));
          }

        }
      });
    // if (user.Role === 'Driver') {

    // }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
