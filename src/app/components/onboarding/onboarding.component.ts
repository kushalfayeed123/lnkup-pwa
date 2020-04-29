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
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { Observable } from 'rxjs/internal/Observable';
import { SubSink } from 'subsink/dist/subsink';
import { AppState } from 'src/app/state/app/app.state';
import { ShowLeftNav, GetCurrentUser, GetUserByEmail, ShowLoader } from 'src/app/state/app/app.actions';


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
  @Select(AppState.getUserByEmail) currentUser$: Observable<Users>;




  todaysDataTime: any;
  today = new Date();
  greeting: string;
  userName: any;
  user: any;
  private unsubscribe$ = new Subject<void>();
  loading: boolean;
  allTrips: boolean;
  message: string;
  userObject: any;
  userRole: any;
  private subs = new SubSink();
  trips: ActiveTrips[];
  currentUser: any;
  loggedInUser: Users;
  userByEmail: Users;


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
    this.store.dispatch(new ShowLeftNav(false));
    this.subs.add(
      this.loggedInUser$.subscribe(res => {
        this.loggedInUser = res;
      }),
      this.currentUser$.subscribe(res => {
        this.currentUser = res;
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
    this.store.dispatch(new GetUserByEmail(this.loggedInUser.email));
    if (this.currentUser !== null) {
      this.userName = this.currentUser.userName;
    } else {
      this.userName = this.loggedInUser.userName;
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
    this.store.dispatch(new ShowLoader(true));
    const updatePayload = {
      userId: this.currentUser.userId,
      email: this.currentUser.email,
      userName: this.currentUser.userName,
      lastName: this.currentUser.lastName,
      phoneNumber: this.currentUser.phoneNumber,
      token: this.currentUser.token,
      userStatus: this.currentUser.userStatus,
      role,
      signupDate: this.currentUser.signupDate,
      signupTime: this.currentUser.signupTime,
      verificationCode: this.currentUser.verificationCode,
      imageUrl: this.currentUser.imageUrl
    };

    this.authService
      .update(updatePayload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        this.authService
          .login(this.currentUser.userName, this.currentUser.password)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(data => {
            this.store.dispatch(new ShowLoader(false))
            if (data.role === 'Rider') {
              this.route.navigate(['rider/home', data.id]);
            } else if (data.role === 'Driver') {
              this.route.navigate(['driver/home', data.id]);
            } else {
              this.route.navigate(['login']);
            }
          });
      });
  }



  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subs.unsubscribe();

  }
}
