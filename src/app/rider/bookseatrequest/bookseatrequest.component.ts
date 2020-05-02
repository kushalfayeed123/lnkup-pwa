import { Component, OnInit, OnDestroy } from '@angular/core';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { Router } from '@angular/router';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { ToastrService } from 'ngx-toastr';
import { PaymentMethod } from 'src/app/models/payment';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { Store, Select } from '@ngxs/store';
import { ShowLeftNav, ShowLoader } from 'src/app/state/app/app.actions';
import { AppState } from 'src/app/state/app/app.state';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { Users } from 'src/app/models/Users';
import { SubSink } from 'subsink/dist/subsink';
import { TripsState } from 'src/app/state/trip/trips.state';
import { GetTripById } from 'src/app/state/trip/trips.action';

@Component({
  selector: 'app-bookseatrequest',
  templateUrl: './bookseatrequest.component.html',
  styleUrls: ['./bookseatrequest.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class BookseatrequestComponent implements OnInit, OnDestroy {
  @Select(AppState.getCurrentUser) currentUSer$: Observable<Users>;
  @Select(TripsState.getSelectedTrip) trips$: Observable<ActiveTrips>;


  private unsubscribe$ = new Subject<void>();
  private subs = new SubSink();
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
  currentUser: Users;
  trip: ActiveTrips;
  constructor(private activeTrip: ActiveTripDataService,
    private activeRiderService: ActiveRiderDataService,
    private router: Router,
    private broadcastService: BroadcastService,
    private toastrService: ToastrService,
    private notifyService: NotificationsService,
    private store: Store) {
    this.notifyService.intiateConnection();

    this.getRiderSuccessAlert();
    // this.getRiderDeclineAlert();
  }

  ngOnInit() {
    this.store.dispatch(new ShowLeftNav(true));
    this.subs.add(
      this.currentUSer$.subscribe(res => {
        this.currentUser = res;
      }),
      this.trips$.subscribe(res => {
        this.trip = res;
      })
    );
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
      this.request.userId = this.currentUser.userId;
      this.request.tripStatus = activeRequest.tripStatus;
      this.request.riderConnectId = connectionId;
      this.request.tripId = this.trip.tripId;
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
        this.request.userId = this.currentUser.userId;
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
      this.store.dispatch(new ShowLoader(this.loading));
      this.getRiderRequest();
      this.activeRiderService.create(this.request)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(data => {
          this.sendNotification();
          this.requestData = data;
          this.loading = false;
          this.store.dispatch(new ShowLoader(this.loading));
          this.gettingDrivers = true;
          localStorage.setItem('gettingDrivers', JSON.stringify(this.gettingDrivers));
          this.store.dispatch(new GetTripById(this.trip.tripId));
        }, error => {
          const message = 'Something went wrong, please try again.';
          this.notifyService.showErrorMessage(message);
          this.loading = false;
          this.store.dispatch(new ShowLoader(this.loading));
        });
    } else {
      this.loading = false;
      this.store.dispatch(new ShowLoader(this.loading));
      this.notifyService.showInfoMessage('Please add a card to continue or change your payment method.');
    }
  }

  cancelRequest() {
    this.activeRiderService.delete(this.currentUser.userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.gettingDrivers = false;
        localStorage.setItem('gettingDrivers', JSON.stringify(this.gettingDrivers));
        this.router.navigate(['/onboarding']);
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
    await this.notifyService.successAlert
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(alert => {
        if (alert === true) {
          this.gettingDrivers = false;
          localStorage.setItem('gettingDrivers', JSON.stringify(this.gettingDrivers));
          this.router.navigate([`rider/home/${this.currentUser.userId}`], { queryParams: { riderLink: true } });
        }
      });
  }



  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
