import { NotificationsService } from './../../services/business/notificatons.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class OnboardingComponent implements OnInit {
  todaysDataTime: any;
  today = new Date();
  greeting: string;
  userName: any;
  user: any;

  constructor(private route: Router, private notify: NotificationsService) {}

  ngOnInit() {
    this.getCurrentime();
  }

  getCurrentime() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.user = user;
    if (user !== null) {
      this.userName = user.userName;
    }
    this.todaysDataTime = formatDate(
      this.today,
      'dd-MM-yyyy hh:mm:ss a',
      'en-US'
    );
    if (this.today.getHours() < 12) {
      this.greeting = 'Good Morning';
    } else if (this.today.getHours() >= 12 && this.today.getHours() <= 16) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  driverNavToHome() {
    if (this.user !== null) {
      if (this.user.role !== 'Driver') {
        this.notify.showErrorMessage(
          'You are logged in as a rider, please login with your driver account to continue.'
        );
        setTimeout(() => {
          this.route.navigate(['/login']);
        }, 3000);
      } else {
        this.route.navigate([`driver/home/${this.user.id}`]);
      }
    } else {
      this.route.navigate(['/login']);
    }
  }

  riderNavToHome() {
    if (this.user !== null) {
      if (this.user.role !== 'Rider') {
        this.notify.showErrorMessage(
          'You are logged in as a driver, please login with your rider account to continue.'
        );
        setTimeout(() => {
          this.route.navigate(['/login']);
        }, 3000);
      } else {
        this.route.navigate([`rider/home/${this.user.id}`]);
      }
    } else {
      this.route.navigate(['/login']);
    }
  }
}
