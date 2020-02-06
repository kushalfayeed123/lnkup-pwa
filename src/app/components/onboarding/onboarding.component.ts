import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from './../../services/business/notificatons.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class OnboardingComponent implements OnInit, OnDestroy {
  todaysDataTime: any;
  today = new Date();
  greeting: string;
  userName: any;
  user: any;
  private unsubscribe$ = new Subject<void>();
  loading: boolean;
  allTrips: boolean;
  message: string;


  constructor(private route: Router, private notify: NotificationsService,
              private activeTrip: ActiveTripDataService,
              private broadcastService: BroadcastService) {}

  ngOnInit() {
    this.getCurrentime();
  }



  getCurrentime() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.user = user;
    if (user !== null) {
      this.getAllTrips();
      this.userName = user.userName;
    }
    this.todaysDataTime = formatDate(
      this.today,
      'dd-MM-yyyy hh:mm:ss a',
      'en-US'
    );
    if (this.today.getHours() < 12) {
      this.greeting = 'Good Morning';
    } else if (this.today.getHours() >= 12 && this.today.getHours() <= 16) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  getAllTrips() {
    this.loading = true;
    this.activeTrip.getAllActiveTrips()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      if (!data) {
        this.allTrips = false;
        return;
      } else {
        this.broadcastService.publishALlTrips(data);
        this.allTrips = true;
      }
      this.loading = false;
    });
  }

  driverNavToHome() {
    if (this.user !== null) {
      if (this.user.role !== 'Driver') {
        this.notify.showErrorMessage(
          'You are logged in as a rider, please login with your driver account to continue.'
        );
        setTimeout(() => {
          this.route.navigate(['/login']);
        }, 3000);
      } else {
        this.route.navigate([`driver/home/${this.user.id}`]);
      }
    } else {
      this.route.navigate(['/login']);
    }
  }

  riderNavToHome() {
    if (!this.allTrips) {
      this.notify.showInfoMessage(this.message);
      return;
    } else {
      if (this.user !== null) {
        if (this.user.role !== 'Rider') {
          this.notify.showErrorMessage(
            'You are logged in as a driver, please login with your rider account to continue.'
          );
          setTimeout(() => {
            this.route.navigate(['/login']);
          }, 3000);
        } else {
          this.route.navigate([`rider/home/${this.user.id}`]);
        }
      } else {
        this.route.navigate(['/login']);
      }
    }
    }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
