import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { Select } from '@ngxs/store';
import { AppState } from 'src/app/state/app.state';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { SubSink } from 'subsink/dist/subsink';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [slideInAnimation]

})
export class SideNavComponent implements OnInit, OnDestroy {

  @Select(AppState.getLoggedInUser) loggedInUser$: Observable<Users>;

  private unsubscribe$ = new Subject<void>();
  _opened: boolean = false;
  showSideNav: boolean;
  userName: any;
  userId: any;
  userRole: any;
  routeId: any;
  events: string[] = [];
  opened: boolean;
  showSpecialChat: boolean;
  private subs = new SubSink();
  loggedInUser: any;



  constructor(changeDetectorRef: ChangeDetectorRef,
    private authService: AuthenticateDataService,
    private broadCastService: BroadcastService,
    private notifyService: NotificationsService,
    media: MediaMatcher,
    public _router: Router,
    private route: ActivatedRoute) {

    this.broadCastService.showSideNav
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(showNav => {
        this.showSideNav = showNav;
        if (this.showSideNav === true) {
          this.getCurrentUser();

        } else {
          return;
        }
      });



  }

  ngOnInit() {
    this.subs.add(
      this.loggedInUser$.subscribe(user => {
        this.loggedInUser = user;
      })
    );
  }

  _toggleSidebar() {
    this._opened = !this._opened;
  }
  navToHome() {
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    this._router.onSameUrlNavigation = 'reload';
    this._router.navigate([`/onboarding`]);
  }
  navToProfile() {
    this._router.navigate([`profile/${this.userId}`]);
  }
  navToSupport() {
    this._router.navigate([`support/${this.userId}`], { queryParams: { reviewType: 'comment' } });
  }
  navToPayment() {
    this._router.navigate([`payment/${this.userId}`]);
  }
  navToTrips() {
    this._router.navigate([`trips/${this.userId}`]);
  }

  navToSpecialChat() {
    this._router.navigate([`support/${this.userId}`], { queryParams: { reviewType: 'chat' } })
    localStorage.setItem('groupName', 'openSesami');
  }
  logout() {
    this.authService.logout();
    this.opened = false;
    this._router.navigate(['/']);
  }

  getCurrentUser() {
    if (this.loggedInUser) {
      this.userName = this.loggedInUser.userName;
      this.userId = this.loggedInUser.id;
      this.userRole = this.loggedInUser.role.toLowerCase();
      if (this.userName === 'segun' || this.userName === 'susan inalegwu') {
        this.showSpecialChat = true;
      } else {
        this.showSpecialChat = false;
      }
    } else {
      return;
    }
  }



  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subs.unsubscribe();
  }

}
