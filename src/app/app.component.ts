import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { MetaService } from './services/business/metaService.service';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationsService } from './services/business/notificatons.service';
import { BroadcastService } from './services/business/broadcastdata.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveTripDataService } from './services/data/active-trip/active-trip.data.service';
import { NetworkStatusAngularService } from 'network-status-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'lnkup';
  newVersion: boolean;
  showSideNav: boolean;
  readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey;
  private unsubscribe$ = new Subject<void>();
  message: any;
  showMessage: boolean;
  riderLink: boolean;
  driverNav: boolean;

  // tslint:disable-next-line: variable-name

  constructor(
    private metaService: MetaService,
    private swUpdate: SwUpdate,
    private broadCastService: BroadcastService,
    private authenticateService: AuthenticateDataService,
    private route: Router,
    private router: ActivatedRoute,
    private activeTrip: ActiveTripDataService,
    private notifyService: NotificationsService,
    private networkStatus: NetworkStatusAngularService
  ) {
    route.events.subscribe(url => {
      this.getCurrentRoute();
    });
    this.networkStatus.status.subscribe(res => {
      if (res === false) {
        this.notifyService.showSuccessMessage(
          'We are currently unable to connect to the LnkuP servers.'
        );
      }
    });
    this.reload();
    this.getLoggedInUser();
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    window.scrollTo(0, 0);
    this.metaService.createCanonicalURL();
    this.showSideNav = false;
  }

  getLoggedInUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const currentRoute = decodeURI(localStorage.getItem('currentRoute'));
    const onGoingTrip = JSON.parse(localStorage.getItem('onGoingTrip'));
    const navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true
    };

    if (!user) {
      this.route.navigate(['/login']);
    } else {
      if (!onGoingTrip) {
        if (!currentRoute) {
          this.route.navigate(['/onboarding']);
        } else {
          this.route.navigateByUrl(`${currentRoute}`, navigationExtras);
        }
      } else {
        this.route.navigateByUrl(`${currentRoute}`, navigationExtras);
      }
    }
    // if (!currentRoute) {
    //   this.route.navigate(['/onboarding']);
    // } else {
    //   const navigationExtras: NavigationExtras = {
    //     queryParamsHandling: 'preserve',
    //     preserveFragment: true
    //   };
    //   if (user) {
    //     const onGoingTrip = JSON.parse(localStorage.getItem('onGoingTrip'));
    //     if (!onGoingTrip) {
    //       this.route.navigateByUrl(`${currentRoute}`, navigationExtras);
    //     } else {
    //       if (user.Role === 'Driver') {
    //         this.route.navigate([`driver/home/${user.id}?driverNav=true`]);
    //       } else {
    //         this.route.navigate([`rider/home/${user.id}?riderLink=true`]);
    //       }
    //     }
    //   } else {
    //     this.route.navigate(['/login']);
    //   }
    // }
  }

  reload() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(next => {
        // if (confirm('A new version is available. Do you want to load it?')) {
        //   window.location.reload();
        //   this.authenticateService.logout();
        // }

        // tslint:disable-next-line: max-line-length
        this.notifyService.showInfoMessage(
          ' New updates are available for your app. Please sit back and relax while we install the updates.'
        );
        this.authenticateService.logout();
        window.location.reload();
      });
    }
  }
  saveCurrentRoute(route) {
    JSON.stringify(localStorage.setItem('currentRoute', route));
  }
  getCurrentRoute() {
    let showSideNav = true;
    const route = this.route.url;
    const profileRoute = route.slice(0, 8);
    const riderRoute = route.slice(0, 6);
    const verifyRoute = route.slice(0, 6);

    const driverRoute = route.slice(0, 7);
    const tripsRoute = route.slice(0, 6);
    const riderRequest = route.slice(0, 21);
    this.router.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(param => {
        if (param.riderLink) {
          this.riderLink = true;
        }
        if (param.driverNav) {
          this.driverNav = true;
        }
      });

    if (this.riderLink) {
      showSideNav = false;
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (this.driverNav) {
      showSideNav = false;
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (riderRoute === '/rider') {
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (riderRequest === '/driver/rider-request') {
      showSideNav = false;
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (driverRoute === '/driver') {
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (verifyRoute === '/verify') {
      showSideNav = false;
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (profileRoute === '/profile') {
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (profileRoute === '/payment') {
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (profileRoute === '/support') {
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (tripsRoute === '/trips') {
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else {
      showSideNav = false;
      this.broadCastService.publishSideNavValue(showSideNav);
      // localStorage.removeItem('currentRoute');
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
