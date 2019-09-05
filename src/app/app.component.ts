import { Component, ViewEncapsulation } from '@angular/core';
import { MetaService } from './services/business/metaService.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class AppComponent {
  title = 'lnkup';
  newVersion: boolean;

  constructor(private metaService: MetaService, private swUpdate: SwUpdate){}

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    this.metaService.createCanonicalURL();
    this.swUpdate.available
    .subscribe(update => this.newVersion = true);
  }

  reload() {
    this.swUpdate.activated
      // tslint:disable-next-line: deprecation
      .subscribe(update => window.location.reload(true));
    this.swUpdate.activateUpdate();
  }
}
