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
              private route: Router) {
                route.events.subscribe(url => {
                    const routeLink = url;
                });
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    this.metaService.createCanonicalURL();
    this.swUpdate.available
    .subscribe(update => this.newVersion = true);
    this.showSideNav = false;
      }

  reload() {
    this.swUpdate.activated
      // tslint:disable-next-line: deprecation
      .subscribe(update => window.location.reload(true));
    this.swUpdate.activateUpdate();
  }
}
