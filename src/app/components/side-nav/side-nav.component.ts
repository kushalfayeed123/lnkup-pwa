import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { slideInAnimation } from 'src/app/services/misc/animation';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [ slideInAnimation ]

})
export class SideNavComponent implements OnDestroy {
    private unsubscribe$ = new Subject<void>();
   _opened: boolean = false;
   showSideNav: boolean;
  userName: any;
  userId: any;
  userRole: any;
  routeId: any;
  events: string[] = [];
  opened: boolean;


  constructor(changeDetectorRef: ChangeDetectorRef,
              private authService: AuthenticateDataService,
              private broadCastService: BroadcastService,
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

   _toggleSidebar() {
    this._opened = !this._opened;
  }
  navToHome() {
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    this._router.onSameUrlNavigation = 'reload';
    this._router.navigate([`${this.userRole}/onboarding`]);
  }
  navToProfile() {
    this._router.navigate([`profile/${this.userId}`]);
  }
  navToSupport() {
    this._router.navigate([`support/${this.userId}`]);
  }
  navToPayment() {
    this._router.navigate([`payment/${this.userId}`]);
  }
  logout() {
    this.authService.logout();
    this.opened = false;
    this._router.navigate(['/']);
  }

   getCurrentUser() {
      const user =  JSON.parse(localStorage.getItem('currentUser'));
      if (user) {
        this.userName = user.userName;
        this.userId = user.id;
        this.userRole = user.role.toLowerCase();
      } else {
        setTimeout(() => {
          const user =  JSON.parse(localStorage.getItem('currentUser'));
          this.userName = user.userName;
          this.userId = user.id;
          this.userRole = user.role.toLowerCase();
        }, 5000);
        return;
      }
  }



  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
