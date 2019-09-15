import { Component, OnInit } from '@angular/core';
import { MapBroadcastService } from '../../services/business/mapbroadcast.service';

@Component({
  selector: 'app-riderlink',
  templateUrl: './riderlink.component.html',
  styleUrls: ['./riderlink.component.scss']
})
export class RiderlinkComponent implements OnInit {
  riderRequestData: any;
  pickupAddress: string;
  driverName: any;

  constructor(private mapService: MapBroadcastService) { }

  ngOnInit() {
    this.getRiderRequest();
  }



  getRiderRequest() {
    this.riderRequestData = JSON.parse(localStorage.getItem('riderRequest'));
    const trip = JSON.parse(localStorage.getItem('tripDetails'));
    this.pickupAddress = trip.tripPickup;
    this.driverName = trip.tripDriver.driver.userName;
    
  }

  cancelRequest() {
    console.log('cancel');
  }

}
