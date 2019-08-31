import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OnboardingComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navToLogin() {
    this.router.navigate(['/auth']);
  }
  navToRegister() {
    this.router.navigate(['/register']);
  }

}
