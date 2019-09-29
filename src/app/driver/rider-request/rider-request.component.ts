import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rider-request',
  templateUrl: './rider-request.component.html',
  styleUrls: ['./rider-request.component.scss']
})
export class RiderRequestComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('loaded');
  }

}
