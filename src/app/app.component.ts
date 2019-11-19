import { Component, ViewEncapsulation } from '@angular/core';
import { MetaService } from './services/business/metaService.service';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationsService } from './services/business/notificatons.service';
import { BroadcastService } from './services/business/broadcastdata.service';
import { environment } from 'src/environments/environment';



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
  // tslint:disable-next-line: variable-name

  constructor(private metaService: MetaService, private swUpdate: SwUpdate,
              private broadCastService: BroadcastService,
              private route: Router,
              private swPush: SwPush) {
                route.events.subscribe(url => {
                  this.getCurrentRoute();
                });
                this.pushNotificationSub();
                // this.getLoggedInUser();
                // this.notificationService.intiateConnection();

              }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    this.metaService.createCanonicalURL();
    this.showSideNav = false;
    this.reload();
      }

  getLoggedInUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      let role = user.role;
      role = role.toLowerCase();
      this.route.navigate([`${role}/home/${user.id}`]);
    } else {
      this.route.navigate(['/']);
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
