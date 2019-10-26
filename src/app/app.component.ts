import { Component, ViewEncapsulation } from '@angular/core';
import { MetaService } from './services/business/metaService.service';
import { SwUpdate } from '@angular/service-worker';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationsService } from './services/business/notificatons.service';



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
  // tslint:disable-next-line: variable-name

  constructor(private metaService: MetaService, private swUpdate: SwUpdate,
              private notificationService: NotificationsService,
              private route: Router) {
                route.events.subscribe(url => {
                  // this.getCurrentRoute();
                });
                this.notificationService.intiateConnection();

              }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    this.metaService.createCanonicalURL();
    this.swUpdate.available
    .subscribe(update => this.newVersion = true);
    this.showSideNav = false;
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

  getCurrentRoute() {
    const route = this.route.url;
    const riderRoute = route.slice(0, 6);
    const driverRoute = route.slice(0, 7);
    if (riderRoute === '/rider') {
      this.showSideNav = true;
    } else if (driverRoute === '/driver') {
      this.showSideNav = true;
    } else {
      this.showSideNav = false;
    }
  }
}
