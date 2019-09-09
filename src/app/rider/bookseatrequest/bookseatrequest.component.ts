import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookseatrequest',
  templateUrl: './bookseatrequest.component.html',
  styleUrls: ['./bookseatrequest.component.scss']
})
export class BookseatrequestComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public counter = 1;
  fare: any;
  activeRiderId: string;
  request: any;
  dropoff: string;
  requestData: any;
  currentValue: number = 1;
  loading: boolean;
  constructor(private broadcastService: BroadcastService,
              private activeRiderService: ActiveRiderDataService,
              private router: Router) { }

  ngOnInit() {
    this.dropoff = localStorage.getItem('dropOff');
    const request = JSON.parse(localStorage.getItem('riderRequest'));
    if (request) {
      this.request = request;
      console.log('first', this.request);
      this.fare = this.request.tripFee;
    } else {
      this.getRiderRequest();
    }
  }
  onValueChanged(value: number): void {
    this.currentValue = value;
}
  getRiderRequest() {
    this.broadcastService.riderRequest
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      setTimeout(() => {
        const activeRequest = JSON.parse(localStorage.getItem('activeRiderRequest'));
        this.request = data;
        this.fare = this.request.tripFee;
        this.request.paymentType = 'cash';
        this.request.paymentStatus = 'Pending';
        this.request.bookedSeat  =  this.currentValue;
        this.request.currentLocationLongitude = activeRequest.currentLocationLongitude;
        this.request.currentLocationLatitude = activeRequest.currentLocationLatitude;
        this.request.riderDestinationLatitude = activeRequest.riderDestinationLatitude;
        this.request.riderDestinationLongitude = activeRequest.riderDestinationLongitude;
        this.request.userId = activeRequest.userId;
        this.request.tripStatus = activeRequest.tripStatus;
        localStorage.setItem('riderRequest', JSON.stringify(this.request));
        console.log(this.dropoff);
      }, 2000);
    });
  }

  createRiderRequest() {
    this.loading = true;
    console.log('request', this.request);
    this.activeRiderService.create(this.request)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.requestData = data;
      this.loading = false;
      this.router.navigate(['riderLink']);
    }, error => {
      console.error('We could not send your request, please try again shortly.');
      this.loading = false;
    });
  }
  increaseValue() {
    this.counter = this.counter + 1;
  }
  decreaseValue() {
    this.counter -= 1;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
