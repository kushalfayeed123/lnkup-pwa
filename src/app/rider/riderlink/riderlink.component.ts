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

@Component({
  selector: 'app-riderlink',
  templateUrl: './riderlink.component.html',
  styleUrls: ['./riderlink.component.scss']
})
export class RiderlinkComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
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

  constructor(private driverDataService: DriverDataDataService,
              private riderService: ActiveRiderDataService,
              private tripService: ActiveTripDataService,
              private authService: AuthenticateDataService,
              public dialog: MatDialog,
              private notifyService: NotificationsService,
              private paymentService: PaymentDataService,
              private router: Router) { }

  ngOnInit() {
    this.getUserdata();
    this.getRiderRequest();
  }



  getRiderRequest() {
    this.riderRequestData = JSON.parse(localStorage.getItem('riderRequest'));
    const trip = JSON.parse(localStorage.getItem('tripDetails'));
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user.id;
    this.pickupAddress = trip.tripPickup;
    const driverId = trip.driverId;
    this.getDriverData();
  }
  getUserdata() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.email = user.email;
  }

  getDriverData() {
    const driverData = JSON.parse(localStorage.getItem('tripDetails'));
    const driverUserId = driverData.driverUserId;
    this.plateNumber = driverData.plateNumber;
    this.authService.getById(driverUserId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.driverData = res;
      console.log('driver', res);
    });
  }

  getLoggedInUserPaymentData() {
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = loggedInUser.id;
    this.authService.getById(userId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(token => {
      this.userPaymentData = token.userPaymentData;
    });
  }

  makePayment() {
    this.generateReference();
    this.showPaymentMessage();
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = loggedInUser.id;
    this.authService.getById(userId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(token => {
      this.userPaymentData = token.userPaymentData;
      this.userPaymentData.forEach(element => {
        this.paymentId = element.paymentId;
        if (this.userPaymentData.length > 1) {
          this.token = element[0].paymentToken;
        } else {
          this.token = element.paymentToken;
        }
      });
      this.confirmPayment();
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
          amount: this.tripFee,
          email: this.email,
          txRef: this.tfx,
          currency: 'NGN'
        };
        // console.log('payment payload', payLoad);
        this.paymentService.tokenizedPayment(payLoad)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(res => {
          if (res.status === 'success') {
            this.notifyService.showSuccessMessage('Thank you. Your payment was successful.');
            const newToken = {
              paymentToken: res.data.chargeToken.embed_token
            };
            console.log('res', res);
            this.paymentService.updatePayment(this.paymentId, newToken)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(token => {
            }, error => {
              console.error('could not update payment');
            });
            // this.router.navigate(['rider/home', this.userId]);
          } else {
            return;
          }
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

  confirmCancelRequest() {
    if (confirm('You will be charged N400 if you cancel, continue?')) {
      this.showPaymentMessage();
      // this.cancelRequest();
    }
  }
  cancelRequest() {
    const trip = JSON.parse(localStorage.getItem('tripDetails'));
    const activerRiderId = trip.activeRiders[0].activeRiderId;
    const tripConnectionId = trip.tripConnectionId;
    const riderName = trip.activeRiders[0].user.userName;
    const message = `Sorry, ${riderName} has just canceled this trip.`;
    this.riderService.delete(activerRiderId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(data => {
      this.tripService.sendDeclineNotification(tripConnectionId, message)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        const alertMessage = 'Your trip request has been canceled.';
        alert(alertMessage);
        this.router.navigate(['/rider/home', this.userId]);
      });
    });
  }

  showPaymentMessage() {
    const request = JSON.parse(localStorage.getItem('riderRequest'));
    this.tripFee = request.tripFee;
    this.name = 'Your fare for this trip';
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '90%',
      panelClass: 'dialog',
      data: {name: this.name, price: this.tripFee}
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.router.navigate(['rider/home', this.userId]);
    });
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
