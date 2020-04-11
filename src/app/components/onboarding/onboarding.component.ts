import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from './../../services/business/notificatons.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs/internal/Subject';
import { Users } from 'src/app/models/Users';
import { Select, Store } from '@ngxs/store';
import { TripsState } from 'src/app/state/trips.state';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { Observable } from 'rxjs/internal/Observable';
import { SubSink } from 'subsink/dist/subsink';
import { GetTrips } from 'src/app/state/trips.action';
import { AppState } from 'src/app/state/app.state';
import { GetCurrentUser } from 'src/app/state/app.actions';


@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class OnboardingComponent implements OnInit, OnDestroy {

  @Select(AppState.getLoggedInUser) loggedInUser$: Observable<Users>;


  todaysDataTime: any;
  today = new Date();
  greeting: string;
  userName: any;
  user: any;
  private unsubscribe$ = new Subject<void>();
  loading: boolean;
  allTrips: boolean;
  message: string;
  userObject: Users;
  userRole: any;
  private subs = new SubSink();
  trips: ActiveTrips[];
  currentUser: any;


  constructor(
    private store: Store,
    private route: Router,
    private notify: NotificationsService,
    private activeTrip: ActiveTripDataService,
    private broadcastService: BroadcastService,
    private authService: AuthenticateDataService
  ) {
    localStorage.removeItem('registeredUser');
  }

  ngOnInit() {
    this.subs.add(
      this.loggedInUser$.subscribe(user => {
        this.currentUser = user;
      })

    );
    this.getCurrentime();
  }
  clearLocalStorage() {
    localStorage.removeItem('tripDetails');
    localStorage.removeItem('storedAddress');
    localStorage.removeItem('riderRequest');
    localStorage.removeItem('pickup');
    localStorage.removeItem('activeRiderRequest');
    localStorage.removeItem('destination');
    localStorage.removeItem('driverData');
  }
  getCurrentime() {

    if (this.currentUser !== null) {
      this.userName = this.currentUser.userName;
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

  updateUserRole(role) {
    this.loading = true;
    this.authService
      .getByEmail(this.currentUser.email)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.userObject = res;
        this.userObject.Role = role;
        const updatePayload = {
          userId: this.userObject.userId,
          email: this.userObject.email,
          userName: this.userObject.userName,
          lastName: this.userObject.lastName,
          phoneNumber: this.userObject.phoneNumber,
          password: this.userObject.password,
          token: this.userObject.token,
          userStatus: this.userObject.userStatus,
          role: this.userObject.Role,
          signupDate: this.userObject.signupDate,
          signupTime: this.userObject.signupTime,
          verificationCode: this.userObject.verificationCode
        };
        this.authService
          .update(updatePayload)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(response => {
            this.store.dispatch(new GetCurrentUser(this.currentUser.id));
            this.authService
              .login(this.userObject.userName, this.userObject.password)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(data => {
                this.loading = false;
                this.userRole = this.authService.decode();
                if (this.userRole.role === 'Rider') {
                  this.route.navigate(['rider/home', this.currentUser.id]);
                } else if (this.userRole.role === 'Driver') {
                  this.route.navigate(['driver/home', this.currentUser.id]);
                } else if (this.userRole.role === 'Admin') {
                  this.route.navigate(['admin/dashboard', this.currentUser.id]);
                } else {
                  this.route.navigate(['login']);
                }
              });
          });
      });
  }

  // driverNavToHome() {
  //   if (this.user !== null) {
  //     if (this.user.role !== 'Driver') {
  //       this.notify.showErrorMessage(
  //         'You are logged in as a rider, please login with your driver account to continue.'
  //       );
  //       setTimeout(() => {
  //         this.route.navigate(['/login']);
  //       }, 3000);
  //     } else {
  //       this.route.navigate([`driver/home/${this.user.id}`]);
  //     }
  //   } else {
  //     this.route.navigate(['/login']);
  //   }
  // }

  // riderNavToHome() {
  //   if (this.user !== null) {
  //     if (this.user.role !== 'Rider') {
  //       this.notify.showErrorMessage(
  //         'You are logged in as a driver, please login with your rider account to continue.'
  //       );
  //       setTimeout(() => {
  //         this.route.navigate(['/login']);
  //       }, 3000);
  //     } else {
  //       this.route.navigate([`rider/home/${this.user.id}`]);
  //     }
  //   } else {
  //     this.route.navigate(['/login']);
  //   }
  // }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subs.unsubscribe();

  }
}
