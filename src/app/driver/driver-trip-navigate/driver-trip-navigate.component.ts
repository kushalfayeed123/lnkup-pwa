import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { MapBroadcastService } from 'src/app/services/business/mapbroadcast.service';
import { BroadcastService } from 'src/app/services/business/broadcastdata.service';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveRiders } from 'src/app/models/ActiveRider';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/services/business/notificatons.service';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { PaymentDataService } from 'src/app/services/data/payment/payment.data.service';
import { formatDate } from '@angular/common';
import { slideInAnimation } from 'src/app/services/misc/animation';

@Component({
  selector: 'app-driver-trip-navigate',
  templateUrl: './driver-trip-navigate.component.html',
  styleUrls: ['./driver-trip-navigate.component.scss'],
  animations: [slideInAnimation],
  host: { '[@slideInAnimation]': '' }
})
export class DriverTripNavigateComponent implements OnInit, OnDestroy {
  public config: any = {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    spaceBetween: 10
  };
  activeTripId: string;
  private unsubscribe$ = new Subject<void>();
  activeTrip: ActiveTrips;
  tripRiders: ActiveRiders[];
  startTrip: boolean;
  endTrip: boolean;
  name: any;
  animal: any;
  userId: any;
  riderNumber: string[] = [];
  cashRiders: ActiveRiders[];
  tripFeeArray = [];
  totalTripFee: any;
  feeToCharge: any;
  isCashPayment: boolean;
  isActive: boolean;
  userPaymentData: any;
  paymentId: any;
  token: string;
  email: any;
  tfx: any;
  currentDate: string;
  message: string;
  dateNow: any;
  activeTripObject: any;



  constructor(private tripService: ActiveTripDataService,
              private broadCastService: BroadcastService,
              public dialog: MatDialog,
              private router: Router,
              private notifyService: NotificationsService,
              private authService: AuthenticateDataService,
              private paymentService: PaymentDataService) { }

  ngOnInit() {
    this.getUser();
    this.getActiveTrip();
  }
  getUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user.id;
    this.email = user.email;
  }
  getActiveTrip() {
    const activeTrip = JSON.parse(localStorage.getItem('activeTrip'));
    this.activeTripId = activeTrip.tripId;
    this.getTripRequest(this.activeTripId);
  }

  getTripRequest(tripId) {
    this.tripService.getTripsById(tripId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(activeTrip => {
        if (activeTrip) {
          this.activeTrip = activeTrip;
          this.tripRiders = activeTrip.activeRiders.filter(x => x.tripStatus === '2');
          this.tripRiders.forEach(tel => {
            let riderNumber = tel.user.phoneNumber;
            riderNumber = riderNumber.slice(0, 4) + riderNumber.slice(5);
            this.riderNumber.push(riderNumber);
          });
          this.cashRiders = activeTrip.activeRiders.filter(c => c.paymentType === 'Cash');
          this.computeCashPayment(this.cashRiders);
          this.isActive = true;
        }

      });
  }

  computeCashPayment(cashRiders) {
    cashRiders.forEach(element => {
      const tripFee = element.tripFee;
      this.tripFeeArray = [...this.tripFeeArray, tripFee];
    });

    this.totalTripFee = this.tripFeeArray.reduce((a, b) => a + b, 0);
    this.feeToCharge = (20 / 100) * this.totalTripFee;
  }

  makePayment() {
    this.generateReference();
    const message = 'We are currently processing your payment please hold on.';
    this.authService.getById(this.userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(token => {
        this.userPaymentData = token.userPaymentData;
        this.userPaymentData.forEach(element => {
          this.notifyService.showInfoMessage(message);
          this.paymentId = element.paymentId;
          this.token = element.paymentToken;
        }, err => {
          this.notifyService.showErrorMessage(err);

        });
        this.confirmPayment();
      }, error => {
        this.notifyService.showErrorMessage('Sorry, we could not fetch your payment data, Please try again.');
      });
  }

  confirmPayment() {
    this.paymentService.getSecKey()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(key => {
        if (key) {
          const payLoad = {
            SECKEY: key.encryptionKey,
            token: this.token,
            amount: this.feeToCharge,
            email: this.email,
            txRef: this.tfx,
            currency: 'NGN',
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
                    this.notifyService.showSuccessMessage('Payment was successful');
                    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                    this.router.onSameUrlNavigation = 'reload';
                    this.router.navigate([`driver/home/${this.userId}`]);
                  }, error => {
                    console.error('could not update payment');
                  });
              } else {
                this.notifyService.showErrorMessage('Sorry, we could not complete your payment please try again.');
                return;
              }
            }, err => {
              this.notifyService.showErrorMessage(err);
              this.showPaymentErrorModal();
            });
        } else {
          return;
        }
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

  getCurrentDateTime() {
    this.currentDate = new Date().toString();
    this.dateNow = formatDate(this.currentDate, ' h:mm a', 'en-US').toLowerCase().substring(1);
  }

  startActiveTrip() {
    this.getCurrentDateTime();
    const tripStartTime =  {actual: this.currentDate, time: this.dateNow};
    localStorage.setItem('tripStartDateTime', JSON.stringify(tripStartTime));
    this.startTrip = true;
    this.endTrip = true;
    this.broadCastService.publishStartTrip(this.startTrip);
    const status = 'start';
    this.updateTripStatus(status);
    this.sendTripMessage(status);
  }

  endActiveTrip() {
    const status = 'end';
    const tripFee = this.activeTrip.aggregrateTripFee;
    const newTripFee = (20 / 100) * tripFee;
    const driverFee = tripFee - newTripFee;
    this.name = 'Your total balance for this trip is';
    this.getCurrentDateTime();
    this.sendTripMessage(status);
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '90%',
      panelClass: 'dialog',
      data: { name: this.name, price: driverFee }
    });
    if (this.cashRiders.length > 0) {
      this.isCashPayment = true;
      this.isActive = false;
    }

    this.updateTripStatus(status);
    dialogRef.afterClosed().subscribe(result => {
      this.endTrip = false;
      localStorage.removeItem('activeTrip');
      localStorage.removeItem('origin');
      localStorage.removeItem('destination');
      if (this.isCashPayment) {
        this.makePayment();
      } else {
        setTimeout(() => {
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate([`driver/home/${this.userId}`]);
          this.clearLocations();

        }, 5000);
      }
    });
  }


  showPaymentErrorModal() {
    this.name = 'We could not process payment on your card, Please try again';
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '90%',
      panelClass: 'dialog',
      data: { name: this.name }
    });
    dialogRef.afterClosed().subscribe(result => {
        this.makePayment();
  });
  }

  clearLocations() {
    localStorage.removeItem('currentLocation');
    localStorage.removeItem('destination');

  }
  sendTripMessage(status: string) {
    this.tripRiders.forEach(element => {
      const recieverId = element.userId;
      const receiver  = element.user.userName;
      if (status === 'end') {
        console.log('status', status, this.tripRiders);
        const message = `Your trip has ended, your fee is ₦${element.tripFee}.`;
        const pushMessage = {
          title: 'LnkuP',
          body: message,
          receiverName: receiver,
          click_action: `https://lnkupmob.azureedge.net/rider/home/${recieverId}`
        };
        this.notifyService.sendNotification(recieverId, pushMessage);
        setTimeout(() => {
          this.notifyService.sendAcceptMessage(recieverId, message);
        }, 5000);
      } else {
        const message = 'Your trip has started.';
        const pushMessage = {
          title: 'LnkuP',
          body: message,
          click_action: `https://lnkupmob.azureedge.net/rider/home/${recieverId}`,
          receiverName: receiver
        };
        this.notifyService.sendNotification(recieverId, pushMessage);
        setTimeout(() => {
          this.notifyService.sendAcceptMessage(recieverId, message);
        }, 5000);
      }
    });
  }

  updateTripStatus(status?: string) {
    const tripConnectionId = sessionStorage.getItem('clientConnectionId');
    if (status === 'end') {
      const tripStartTimes = JSON.parse(localStorage.getItem('tripStartDateTime'));
      this.activeTripObject = {
        driverTripStatus: 0,
        allowedRiderCount: 0,
        tripConnectionId,
        actualTripEndDateTime: this.currentDate,
        tripEndDateTime: this.dateNow,
        actualTripStartDateTime: tripStartTimes.actual,
        tripStartDateTime: tripStartTimes.time,
      };
    } else {
      this.activeTripObject = {
        driverTripStatus: 3,
        allowedRiderCount: 0,
        tripConnectionId,
        actualTripStartDateTime: this.currentDate,
        tripStartDateTime: this.dateNow,
        actualTripEndDateTime: 'null',
        tripEndDateTime: 'null'
      };
    }
    this.tripService.updateTrip(this.activeTripId, this.activeTripObject)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
      }, error => {
        console.log(error);
        this.updateTripStatus();
      });
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
