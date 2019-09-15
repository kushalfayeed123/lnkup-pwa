import { Component, ViewEncapsulation } from '@angular/core';
import { MetaService } from './services/business/metaService.service';
import { SwUpdate } from '@angular/service-worker';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class AppComponent {
  title = 'lnkup';
  newVersion: boolean;
  showSideNav: boolean;

  constructor(private metaService: MetaService, private swUpdate: SwUpdate, private route: Router) {
    route.events.subscribe((url) => console.log(route.url));
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    this.metaService.createCanonicalURL();
    this.swUpdate.available
    .subscribe(update => this.newVersion = true);

    this.showSideNav = false;

    // const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // if (currentUser) {
    //   const userId = currentUser.id;
    //   if (currentUser.Role === 'Rider') {
    //     this.route.navigate([`rider/home`, userId]);
    //   } else if ( currentUser.Role === 'Driver') {
    //     this.route.navigate([`driver/home`, userId]);
    //   } else {
    //     this.route.navigate([`admin/home/`, userId]);
    //   }
    // } else {
    //   this.route.navigate(['onboarding']);
    // }

  }

  reload() {
    this.swUpdate.activated
      // tslint:disable-next-line: deprecation
      .subscribe(update => window.location.reload(true));
    this.swUpdate.activateUpdate();
  }
}
