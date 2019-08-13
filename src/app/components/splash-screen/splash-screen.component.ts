import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {

  constructor(private route: Router) { }

  ngOnInit() {
    this.closeSplash();
    
  }

  closeSplash(){
    setTimeout(() => {
      this.route.navigate(['/onboarding']);
    }, 10000);
  }

}
