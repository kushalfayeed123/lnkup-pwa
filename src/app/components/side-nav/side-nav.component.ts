import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { SubSink } from 'subsink/dist/subsink';
import { AppState } from 'src/app/state/app/app.state';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [slideInAnimation]

})
export class SideNavComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Select(AppState.getLoggedInUser) loggedInUser$: Observable<Users>;
  @Select(AppState.showLeftNav) showLeftNav$: Observable<boolean>;


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



  constructor(private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthenticateDataService,
    private broadCastService: BroadcastService,
    private notifyService: NotificationsService,
    media: MediaMatcher,
    public _router: Router,
    private route: ActivatedRoute) { }


  ngAfterViewChecked() {
    this.subs.add(
      this.showLeftNav$.subscribe(res => {
        this.showSideNav = res;
      })
    );
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {

    this.subs.add(
      this.loggedInUser$.subscribe(user => {
        this.loggedInUser = user;
        this.getCurrentUser();

      }),
      this.showLeftNav$.subscribe(res => {
        this.showSideNav = res;
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
      if (this.userName === 'segun' || this.userName === 'susan') {
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
