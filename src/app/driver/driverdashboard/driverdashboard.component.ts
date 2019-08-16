import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './driverdashboard.component.html',
  styleUrls: ['./driverdashboard.component.scss']
})
export class DriverdashboardComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navtologin(){
    this.router.navigate(['auth'])
  }
  navtoregister(){
    this.router.navigate(['register'])
  }
}
