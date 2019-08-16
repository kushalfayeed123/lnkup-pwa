import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { popInAnimation } from 'src/app/services/misc/landinganimation';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [popInAnimation],
  host: { '[@popInAnimation]': '' }
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navtologin() {
    this.router.navigate(['auth']);
  }
  navtoregister() {
    this.router.navigate(['register']);
  }

}
