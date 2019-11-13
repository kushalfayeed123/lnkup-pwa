import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
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
    });
    setTimeout(() => {
      this.getCurrentUser();
    }, 3000);
  }

   _toggleSidebar() {
    this._opened = !this._opened;
  }
  navToHome() {
    this._toggleSidebar();
    this.opened = false;
    this._router.navigate([`${this.userRole}/home/${this.userId}`]);
  }
  navToProfile() {
    this._toggleSidebar();
    this.opened = false;
    this._router.navigate([`profile/${this.userId}`]);

  }
  logout() {
    this.authService.logout();
    this.opened = false;
    this._router.navigate(['/']);
  }

  async getCurrentUser() {
      const user = await  JSON.parse(localStorage.getItem('currentUser'));
      if (user) {
        this.userName = user.userName;
        this.userId = user.id;
        this.userRole = user.role.toLowerCase();
      } else {
        return;
      }
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
