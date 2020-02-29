import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { Router } from '@angular/router';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { ToastrService } from 'ngx-toastr';
import { PaymentMethod } from 'src/app/models/payment';
import { slideInAnimation } from 'src/app/services/misc/animation';

@Component({
  selector: 'app-bookseatrequest',
  templateUrl: './bookseatrequest.component.html',
  styleUrls: ['./bookseatrequest.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
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
  selectedPaymentMethod: string;
  paymentMethod = [
    { name: 'Cash' },
    { name: 'Card' }
  ];
  userPaymentStatus: any;
  canCreateTrip: boolean;
  constructor(private activeTrip: ActiveTripDataService,
              private activeRiderService: ActiveRiderDataService,
              private router: Router,
              private broadcastService: BroadcastService,
              private toastrService: ToastrService,
              private notifyService: NotificationsService) {
    this.notifyService.intiateConnection();

    this.getRiderSuccessAlert();
    // this.getRiderDeclineAlert();
  }

  ngOnInit() {
    this.dropoff = localStorage.getItem('storedAddress');
    this.getTripDetails();
    this.getRiderRequest();
    // this.notifyService.sendAcceptMessage();
    this.gettingDriversCheck();
  }

  gettingDriversCheck() {
    const gettingDrivers = JSON.parse(localStorage.getItem('gettingDrivers'));
    if (!gettingDrivers) {
      this.gettingDrivers = false;
    } else {
      this.gettingDrivers = true;
    }
  }
  computeTripFare(value) {
    const tripFare = value * this.fare;
    if (value > this.availableSeats) {
      this.inValidSeat = true;
    } else {
      this.inValidSeat = false;
      this.seatCount = value;
      this.newFare = tripFare;
    }
  }
  setPaymentMethod(value) {
    localStorage.setItem('paymentType', value);
    if (value === 'Card') {
      this.broadcastService.paymentStatus
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(status => {
          if (!status) {
            this.canCreateTrip = false;
            this.notifyService.showInfoMessage('Please add a card to continue or change your payment method.');
            return;
          } else {
            this.canCreateTrip = true;
            this.selectedPaymentMethod = value;
          }
        });
    } else {
      this.canCreateTrip = true;
      this.selectedPaymentMethod = value;
    }
  }
  getTripDetails() {
    const tripDetails = JSON.parse(localStorage.getItem('tripDetails'));
    const allowedRiderCount = tripDetails.allowedRiderCount;
    const maxSeats = tripDetails.maxRiderNumber;
    this.driverId = tripDetails.driverId;
    // this.driverName = tripDetails.user.userName;
    this.driverEmail = tripDetails.driverEmail;
    if (allowedRiderCount === 0) {
      this.availableSeats = maxSeats;
    } else {
      this.availableSeats = allowedRiderCount;
    }
  }
  getRiderRequest() {
    const activeRequest = JSON.parse(localStorage.getItem('activeRiderRequest'));
    this.request = JSON.parse(localStorage.getItem('riderRequest'));
    const connectionId = sessionStorage.getItem('clientConnectionId');
    if (activeRequest != null && this.request != null) {
      this.fare = this.request.tripFee;
      this.request.tripFee = this.newFare;
      this.request.paymentType = this.selectedPaymentMethod;
      this.request.paymentStatus = '0';
      this.request.bookedSeat = this.seatCount;
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
        this.request.paymentType = this.selectedPaymentMethod;
        this.request.paymentStatus = '0';
        this.request.bookedSeat = this.seatCount;
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
    if (this.canCreateTrip) {
      this.loading = true;
      this.getRiderRequest();
      this.activeRiderService.create(this.request)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(data => {
          this.sendNotification();
          this.requestData = data;
          this.loading = false;
          this.gettingDrivers = true;
          localStorage.setItem('gettingDrivers', JSON.stringify(this.gettingDrivers));
        }, error => {
          const message = 'A network error occured, please try again.';
          this.notifyService.showErrorMessage(message);
          this.loading = false;
        });
    } else {
      this.loading = false;
      this.notifyService.showInfoMessage('Please add a card to continue or change your payment method.');
    }
  }

  cancelRequest() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.activeRiderService.delete(user.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.gettingDrivers = false;
        localStorage.setItem('gettingDrivers', JSON.stringify(this.gettingDrivers));
        this.router.navigate([`rider/home/${user.id}`]);
      });
  }

  sendNotification() {
    const message = 'A new rider has joined your trip.';
    const userId = this.driverId;
    const pushMessage = {
      title: 'LnkuP Request',
      body: message,
      receiverName: this.driverEmail,
      click_action: `https://lnkupmob.azureedge.net/driver/rider-request`

    };
    this.notifyService.sendNotification(userId, pushMessage);
    setTimeout(() => {
      this.notifyService.sendAcceptMessage(userId, message);
    }, 5000);
  }


  async getRiderSuccessAlert() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.id;
    await this.notifyService.successAlert
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(alert => {
        if (alert) {
          this.gettingDrivers = false;
          localStorage.setItem('gettingDrivers', JSON.stringify(this.gettingDrivers));
          this.router.navigate([`rider/home/${userId}`], { queryParams: { riderLink: true } });
        }
      });
  }



  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
