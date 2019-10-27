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


  constructor(changeDetectorRef: ChangeDetectorRef,
              private authService: AuthenticateDataService,
              private broadCastService: BroadcastService,
              media: MediaMatcher,
              public _router: Router) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.broadCastService.showSideNav
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(showNav => {
      this.showSideNav = showNav;
    });
  }

  mobileQuery: MediaQueryList;

  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);



  private _mobileQueryListener: () => void;

   _toggleSidebar() {
    this._opened = !this._opened;
  }
  
  logout() {
    this.authService.logout();
    this._router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
