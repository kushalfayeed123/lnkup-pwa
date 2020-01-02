import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { MetaService } from './services/business/metaService.service';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationsService } from './services/business/notificatons.service';
import { BroadcastService } from './services/business/broadcastdata.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';



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

  // tslint:disable-next-line: variable-name

  constructor(private metaService: MetaService, private swUpdate: SwUpdate,
    private broadCastService: BroadcastService,
    private authenticateService: AuthenticateDataService,
    private route: Router,
    private notifyService: NotificationsService) {
    route.events.subscribe(url => {
      this.getCurrentRoute();
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
    if (user) {
      const currentRoute = localStorage.getItem('currentRoute');
      this.route.navigate([currentRoute]);
    } else {
      this.route.navigate(['/onboarding']);
    }
  }

  reload() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(next => {
        if (confirm('A new version is available. Do you want to load it?')) {
          window.location.reload();
          this.authenticateService.logout();
        }
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
    const driverRoute = route.slice(0, 7);
    if (riderRoute === '/rider') {
      this.broadCastService.publishSideNavValue(showSideNav);
      this.saveCurrentRoute(route);
    } else if (driverRoute === '/driver') {
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

    } else {
      showSideNav = false;
      this.broadCastService.publishSideNavValue(showSideNav);
    }
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
