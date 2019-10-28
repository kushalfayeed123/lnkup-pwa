import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnDestroy {
    private unsubscribe$ = new Subject<void>();
   _opened: boolean = false;
   showSideNav: boolean;
  userName: any;
  userId: any;
  userRole: any;


  constructor(changeDetectorRef: ChangeDetectorRef,
              private authService: AuthenticateDataService,
              private broadCastService: BroadcastService,
              media: MediaMatcher,
              public _router: Router) {
    this.broadCastService.showSideNav
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(showNav => {
      this.showSideNav = showNav;
    });
    this.getCurrentUser();
  }

  mobileQuery: MediaQueryList;

  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);



  private _mobileQueryListener: () => void;

   _toggleSidebar() {
    this._opened = !this._opened;
  }
  navToHome() {
    this._toggleSidebar();
    this._router.navigate([`${this.userRole}/home/${this.userId}`]);
  }
  navToProfile() {
    this._toggleSidebar();
    this._router.navigate([`profile/${this.userId}`]);

  }
  logout() {
    this.authService.logout();
    this._toggleSidebar();
    this._router.navigate(['/']);
  }

  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userName = user.userName;
    this.userId = user.id;
    this.userRole = user.role.toLowerCase();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
