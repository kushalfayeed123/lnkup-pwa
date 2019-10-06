import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { Router } from '@angular/router';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';

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
  currentValue = 1;
  loading: boolean;
  seatCount: any;
  newFare: number;
  tripConnectionId: any;
  constructor(private activeTrip: ActiveTripDataService,
              private activeRiderService: ActiveRiderDataService,
              private router: Router,
              private notifyService: NotificationsService) {
                this.getRiderAlert();
               }

  ngOnInit() {
    this.dropoff = localStorage.getItem('storedAddress');
    this.getRiderRequest();

  }
  computeTripFare(value) {
    const tripFare = value * this.fare;
    this.newFare = tripFare;
    this.seatCount = value;
  }
  getRiderRequest() {
        const activeRequest = JSON.parse(localStorage.getItem('activeRiderRequest'));
        this.request = JSON.parse(localStorage.getItem('riderRequest'));
        const connectionId = sessionStorage.getItem('clientConnectionId');
        this.fare = this.request.tripFee;
        this.request.tripFee = this.newFare;
        this.request.paymentType = 'cash';
        this.request.paymentStatus = 'Pending';
        this.request.bookedSeat  =  this.seatCount;
        this.request.currentLocationLongitude = activeRequest.currentLocationLongitude;
        this.request.currentLocationLatitude = activeRequest.currentLocationLatitude;
        this.request.riderDestinationLatitude = activeRequest.riderDestinationLatitude;
        this.request.riderDestinationLongitude = activeRequest.riderDestinationLongitude;
        this.request.userId = activeRequest.userId;
        this.request.tripStatus = activeRequest.tripStatus;
        this.request.riderConnectId = connectionId;
        this.tripConnectionId = this.request.tripConnectionId;
        localStorage.setItem('riderRequest', JSON.stringify(this.request));
        console.log(this.dropoff);
  }

  createRiderRequest() {
    this.loading = true;
    this.getRiderRequest();
    this.activeRiderService.create(this.request)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.sendNotification();
      this.requestData = data;
      this.loading = false;
    }, error => {
      console.error('We could not send your request, please try again shortly.');
      this.loading = false;
    });
  }

  sendNotification() {
    const message = 'A user just requested for a trip';
    this.activeTrip.sendNotification(this.tripConnectionId, message)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      console.log('message sent', data);
    });
  }

 async getRiderAlert() {
    await this.notifyService.alert
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(alert => {
      if (alert) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const userId = user.id;
        this.router.navigate([`rider/home/${userId}`], { queryParams: { riderLink: true } });
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
