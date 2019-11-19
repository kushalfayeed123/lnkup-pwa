import { Component, ViewEncapsulation } from '@angular/core';
import { MetaService } from './services/business/metaService.service';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationsService } from './services/business/notificatons.service';
import { BroadcastService } from './services/business/broadcastdata.service';
import { environment } from 'src/environments/environment';
import { AuthenticateDataService } from './services/data/authenticate.data.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None

})
export class AppComponent {
  title = 'lnkup';
  newVersion: boolean;
  showSideNav: boolean;
  readonly VAPID_PUBLIC_KEY = '9dIdipwZchTnDphNemFLYbCNNzW9LfOpMhcc-gmxXJE';
  public userRole = {} as any;

  // tslint:disable-next-line: variable-name

  constructor(private metaService: MetaService, private swUpdate: SwUpdate,
              private broadCastService: BroadcastService,
              private authenticate: AuthenticateDataService,
              private route: Router,
              private swPush: SwPush) {
                route.events.subscribe(url => {
                  this.getCurrentRoute();
                  this.redirectUser();
                });
                this.pushNotificationSub();
              }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    this.metaService.createCanonicalURL();
    this.showSideNav = false;
    this.reload();
      }

 
  redirectUser() {
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    if (loggedInUser) {
      this.userRole = this.authenticate.decode();
      const userId = loggedInUser.id;
      if (this.userRole.role === 'Rider') {
        this.route.navigate(['rider/home', userId]);
      } else if (this.userRole.role ===  'Driver') {
        this.route.navigate(['driver/home', userId]);
      } else if (this.userRole.role === 'Admin') {
        this.route.navigate(['admin/dashboard', userId]);
      } else {
        this.route.navigate(['login']);
      }
    }
  }

  reload() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(next => {
        if (confirm('A new version is available. Do you want to load it?')) {
          window.location.reload();
        }
      });
    }
  }
  pushNotificationSub()  {

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => console.log(sub) )
    .catch(err => console.error('Could not subscribe to notifications'));
  }

  getCurrentRoute() {
    const route = this.route.url;
    const profileRoute = route.slice(0, 8);
    const riderRoute = route.slice(0, 6);
    const driverRoute = route.slice(0, 7);
    if (riderRoute === '/rider') {
      const showSideNav = true;
      this.broadCastService.publishSideNavValue(showSideNav);
    } else if (driverRoute === '/driver') {
      const showSideNav = true;
      this.broadCastService.publishSideNavValue(showSideNav);
    } else if (profileRoute === '/profile') {
      const showSideNav = true;
      this.broadCastService.publishSideNavValue(showSideNav);
    } else {
      const showSideNav = false;
      this.broadCastService.publishSideNavValue(showSideNav);
    }
  }
}
