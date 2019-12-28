import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { Router } from '@angular/router';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import {  ToastrService } from 'ngx-toastr';

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
  availableSeat: number;
  availableSeats: number;
  inValidSeat: boolean;
  driverId: any;
  driverEmail: any;
  gettingDrivers: boolean;
  driverName: any;
  constructor(private activeTrip: ActiveTripDataService,
              private activeRiderService: ActiveRiderDataService,
              private router: Router,
              private broadcastService: BroadcastService,
              private toastrService: ToastrService,
              private notifyService: NotificationsService) {
                this.getRiderSuccessAlert();
                this.getRiderDeclineAlert();
               }

  ngOnInit() {
    this.dropoff = localStorage.getItem('storedAddress');
    this.getTripDetails();
    this.getRiderRequest();
    this.notifyService.intiateConnection();

    // this.notifyService.sendAcceptMessage();

  }
  computeTripFare(value) {
    const tripFare = value * this.fare;
    if (value > this.availableSeats) {
      console.log(`this trip has ${this.availableSeats} seat(s) left.`);
      this.inValidSeat = true;
    } else {
      this.inValidSeat = false;
      this.seatCount = value;
      this.newFare = tripFare;
    }
  }
  getTripDetails() {
    const tripDetails = JSON.parse(localStorage.getItem('tripDetails'));
    const allowedRiderCount = tripDetails.allowedRiderCount;
    const maxSeats = tripDetails.maxRiderNumber;
    this.driverId = tripDetails.driverId;
    // this.driverName = tripDetails.user.userName;
    this.driverEmail = tripDetails.driverEmail;
    console.log('DRIVER ID', this.driverId);
    if (allowedRiderCount === 0) {
      this.availableSeats = maxSeats;
    } else {
      this.availableSeats =  allowedRiderCount;
    }
  }
  getRiderRequest() {
        const activeRequest = JSON.parse(localStorage.getItem('activeRiderRequest'));
        this.request = JSON.parse(localStorage.getItem('riderRequest'));
        const connectionId = sessionStorage.getItem('clientConnectionId');
        if (activeRequest != null && this.request != null) {
          this.fare = this.request.tripFee;
          this.request.tripFee = this.newFare;
          this.request.paymentType = 'card';
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
        } else {
          setTimeout(() => {
            this.fare = this.request.tripFee;
            this.request.tripFee = this.newFare;
            this.request.paymentType = 'card';
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
          }, 5000);
        }
       
  }

  createRiderRequest() {
    this.loading = true;
    this.getRiderRequest();
    this.activeRiderService.create(this.request)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.sendNotification();
      const message = 'Your trip request has been sent. Your driver will respond soon.';
      this.notifyService.showInfoMessage(message);
      this.requestData = data;
      this.loading = false;
      this.gettingDrivers = true;
    }, error => {
      const message = 'We could not send your request, please try again.';
      this.notifyService.showErrorMessage(message);
      this.loading = false;
    });
  }

  sendNotification() {
    const message = 'You have a new LnkuP request';
    const userId =  this.driverId;
    const pushMessage = {
      title: 'Lnkup Request',
      body: message,
      click_action: `https://lnkupmob.azureedge.net/driver/rider-request`,
      receiverName: this.driverEmail
    };
    this.notifyService.sendAcceptMessage(userId, message);
    this.notifyService.sendNotification(userId, pushMessage);
  }


 async getRiderSuccessAlert() {
    await this.notifyService.successAlert
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(alert => {
      if (alert) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const userId = user.id;
        this.router.navigate([`rider/home/${userId}`], { queryParams: { riderLink: true } });
      }
    });
  }

  async getRiderDeclineAlert() {
    await this.notifyService.declineAlert
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(alert => {
      if (alert) {
        console.log('alert', alert);
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const userId = user.id;
        this.router.navigate([`rider/home/${userId}`]);
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
