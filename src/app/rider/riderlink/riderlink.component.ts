import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapBroadcastService } from '../../services/business/mapbroadcast.service';
import { ActiveRiderDataService } from 'src/app/services/data/active-rider/active-rider.data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { Router } from '@angular/router';
import { DriverDataDataService } from 'src/app/services/data/driver-data/driver-data.data.service';
import { DriverData } from 'src/app/models/DriverData';
import { MatDialog } from '@angular/material';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { Users } from 'src/app/models/Users';
import { PaymentDataService } from 'src/app/services/data/payment/payment.data.service';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { UserPaymentToken } from 'src/app/models/payment';
import { slideInAnimation } from 'src/app/services/misc/animation';
import { Select, Store } from '@ngxs/store';
import { AppState } from 'src/app/state/app/app.state';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink/dist/subsink';
import { TripsState } from 'src/app/state/trip/trips.state';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ShowLeftNav } from 'src/app/state/app/app.actions';
import { GetChatObject } from 'src/app/state/chat/chat.action';

@Component({
  selector: 'app-riderlink',
  templateUrl: './riderlink.component.html',
  styleUrls: ['./riderlink.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class RiderlinkComponent implements OnInit, OnDestroy {
  @Select(AppState.getCurrentUser) user$: Observable<Users>;
  @Select(TripsState.getSelectedTrip) trips$: Observable<ActiveTrips>;


  private unsubscribe$ = new Subject<void>();
  private subs = new SubSink();
  riderRequestData: any;
  pickupAddress: string;
  driverName: any;
  userId: any;
  driverId: any;
  driverData: Users;
  driverImage: string;
  name: string;
  plateNumber: any;
  tfx: string;
  token: any;
  tripFee: any;
  email: any;
  paymentId: any;
  userPaymentData: any;
  driverAccountId: any;
  driverNumber: string;
  showPaymentButton: boolean;
  activeRiderId: string;
  riderConnectId: string;
  onGoingTrip: boolean;
  hideCancelButton: boolean;
  loading: boolean;
  user: Users;
  trip: ActiveTrips;
  driver: any;

  constructor(private driverDataService: DriverDataDataService,
    private riderService: ActiveRiderDataService,
    private tripService: ActiveTripDataService,
    private authService: AuthenticateDataService,
    public dialog: MatDialog,
    private broadCastService: BroadcastService,
    private notifyService: NotificationsService,
    private paymentService: PaymentDataService,
    private router: Router,
    private store: Store) {

    this.notifyService.endTrip
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res === true) {
          this.showPaymentMessage();
          this.hideCancelButton = false;
        } else if (res === false) {
          this.hideCancelButton = true;
        }
      });
  }

  ngOnInit() {
    this.store.dispatch(new ShowLeftNav(false));
    this.subs.add(
      this.user$.subscribe(res => {
        this.user = res;
        this.getUserdata(res);
      }),
      this.trips$.subscribe(res => {
        this.trip = res;
        this.getRiderRequest();
        this.getActiveRiderData();
      })
    );
    this.getRiderDeclineAlert();
  }



  getRiderRequest() {
    this.riderRequestData = JSON.parse(localStorage.getItem('riderRequest'));
    const trip = JSON.parse(localStorage.getItem('tripDetails'));
    this.pickupAddress = trip.tripPickup;
    const driverId = trip.driverId;
    this.getDriverData();
    // this.listenToTripCancel();
  }

  navToSupport(driverId) {
    const chatObject = {
      groupName: this.user.userName,
      receiverId: driverId,
      senderId: this.user.userId,
      receiverName: this.driverName
    };
    this.store.dispatch(new GetChatObject(chatObject));
    this.router.navigate(['support', this.user.userId]);
  }

  // listenToTripCancel() {
  //   this.notifyService.declineAlert
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe(decline => {
  //       if (decline) {
  //         this.router.navigate(['rider/home',this.userId]);
  //       }
  //     });
  // }

  async getRiderDeclineAlert() {
    await this.notifyService.declineAlert
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(alert => {
        if (alert) {
          this.router.navigate([`/onboarding`]);
        }
      });
  }
  getUserdata(user) {
    this.email = user.email;
    const request = JSON.parse(localStorage.getItem('riderRequest'));
    this.tripFee = request.tripFee;
  }

  getDriverData() {
    const driverData = JSON.parse(localStorage.getItem('tripDetails'));
    this.plateNumber = driverData.plateNumber;
    this.driverAccountId = driverData.driverAccountId;
    this.driver = this.trip.tripDriver.driver;
    this.driverName = this.trip.tripDriver.driver.userName;
    const driverNumber = this.trip.tripDriver.driver.phoneNumber;
    this.driverNumber = driverNumber.slice(0, 4) + driverNumber.slice(5);
    localStorage.setItem('groupName', this.driverName);
  }

  getLoggedInUserPaymentData() {
    this.authService.getById(this.user.userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(token => {
        this.userPaymentData = token.userPaymentData;
      });
  }

  makePayment() {
    const paymentMethod = localStorage.getItem('paymentType');
    if (paymentMethod === 'Card') {
      this.generateReference();
      const message = 'We are currently processing your payment please hold on.';
      this.notifyService.showInfoMessage(message);
      this.authService.getById(this.user.userId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(token => {
          this.userPaymentData = token.userPaymentData;
          this.userPaymentData.forEach(element => {
            this.paymentId = element.paymentId;
            this.token = element.paymentToken;
          }, err => {
            this.notifyService.showErrorMessage(err);
          });
          this.confirmPayment();
        }, error => {
          this.notifyService.showErrorMessage('Sorry, we could not fetch your payment data, Please try again.');
          this.showPaymentButton = true;
        });
    } else {
      return;
    }

  }

  getActiveRiderData() {
    const activeRiders = this.trip.activeRiders;
    activeRiders.filter(a => a.userId === this.user.userId);
    if (activeRiders) {
      const onGoingTrip = true;
      localStorage.setItem('onGoingTrip', JSON.stringify(onGoingTrip));
    }
    this.activeRiderId = activeRiders[0].activeRiderId;
    this.riderConnectId = activeRiders[0].riderConnectId;
  }

  confirmPayment() {

    this.paymentService.getSecKey()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(key => {
        if (key) {
          const payLoad = {
            SECKEY: key.encryptionKey,
            token: this.token,
            amount: this.tripFee,
            email: this.email,
            txRef: this.tfx,
            currency: 'NGN',
            subaccounts: [{
              id: this.driverAccountId
            }]
          };
          // console.log('payment payload', payLoad);
          this.paymentService.tokenizedPayment(payLoad)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(res => {
              if (res.status === 'success') {
                const newToken = {
                  paymentToken: res.data.chargeToken.embed_token
                };
                this.paymentService.updatePayment(this.paymentId, newToken)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(token => {
                    this.updateActiveRider();
                  }, error => {
                    console.error('could not update payment');
                  });
              } else {
                this.notifyService.showErrorMessage('Sorry, we could not complete your payment please try again.');
                this.showPaymentButton = true;
                return;
              }
            }, err => {
              this.notifyService.showErrorMessage(err);
            });
        } else {
          return;
        }
      });
  }

  updateActiveRider() {
    const activeRider = {
      tripStatus: '2',
      paymentStatus: '1',
      riderConnectId: this.riderConnectId
    };
    this.riderService.update(this.activeRiderId, activeRider)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        localStorage.removeItem('currentLocation');
        this.notifyService.showSuccessMessage('Thank you. Your payment was successful.');

        this.router.navigate(['/onboarding']);
      }, error => {
        console.log(error);
      });
  }

  generateReference() {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      this.tfx = text;
    }
  }

  confirmCancelRequest() {
    if (confirm('You will be charged N400 if you cancel, continue?')) {
      // this.cancelRequest();
    }
  }
  cancelRequest() {
    this.loading = true;
    const trip = JSON.parse(localStorage.getItem('riderRequest'));
    const tripId = trip.tripId;
    this.tripService.getTripsById(this.trip.tripId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        const activeRiders = res.activeRiders;
        const currentRider = activeRiders.find(x => x.user.userId === this.user.userId);
        console.log('current user', res);
        const riderName = currentRider.user.userName;
        const activeRiderId = currentRider.activeRiderId;
        this.riderService.delete(activeRiderId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(data => {
            this.sendNotification(res.tripDriver.driverId, res.tripDriver.driver.userName, riderName);
            this.loading = false;
            const alertMessage = 'Your trip request has been cancelled.';
            this.notifyService.showErrorMessage(alertMessage);
            this.router.navigate(['/onboarding']);
          });
      });

  }

  sendNotification(userId, userName, riderName) {
    const message = `Sorry, ${riderName} has just cancelled this trip.`;
    const pushMessage = {
      title: 'LnkuP Trip',
      body: message,
      receiverName: userName,
      click_action: `https://lnkupmob.azureedge.net/driver/rider-request`

    };
    this.notifyService.sendNotification(userId, pushMessage);
    setTimeout(() => {
      this.notifyService.sendAcceptMessage(userId, message);
    }, 5000);
  }

  showPaymentMessage() {
    // this.name = 'Please Confirm Payment. Your fare for this trip is';
    // const dialogRef = this.dialog.open(ModalComponent, {
    //   width: '90%',
    //   panelClass: 'dialog',
    //   data: { name: this.name, price: this.tripFee }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    // });
    const paymentMethod = localStorage.getItem('paymentType');
    if (paymentMethod === 'Card') {
      this.notifyService.showSuccessMessage(`Your trip has ended. A fee of ??? ${this.tripFee} will be charged on your card. Thank you for riding with lnkup.`);
      setTimeout(() => {
        this.makePayment();
      }, 7000);
    } else {
      this.updateActiveRider();
      // this.notifyService.showSuccessMessage(`Your trip has ended. Please pay ${this.driverName} a sum of ??? ${this.tripFee} cash. Thank you for riding with lnkup.`);
      // this.router.navigate(['/onboarding']);
    }
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
