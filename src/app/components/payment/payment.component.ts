import { NotificationsService } from './../../services/business/notificatons.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaymentInstance, RaveOptions } from 'angular-rave';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PaymentDataService } from 'src/app/services/data/payment/payment.data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Payment } from 'src/app/models/payment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentInstance: PaymentInstance;
  token: string;
  paymentOptions: RaveOptions = {
    PBFPubKey: 'FLWPUBK_TEST-de83d2331a09f1d56894a397f1aab8ec-X',
    customer_email: 'segunajanaku@gmail.com',
    customer_firstname: 'segs',
    customer_lastname: 'test',
    currency: 'NGN',
    custom_description: 'Payment for goods',
    amount: 500,
    customer_phone: '09026464646',
    txref: 'ksdfdshd8487djd'
  };
  isCard: boolean;
  isCash: boolean;
  cardDetailsForm: FormGroup;
  PBFPubKey: string;
  currency: string;
  country: string;
  amount: string;
  tfx: string;
  redirect: string;
  userId: any;
  userName: any;
  userPhone: any;
  userEmail: any;
  cardno: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  private unsubscribe$ = new Subject<void>();
  encryptedData: Payment;
  userRole: any;
  billingZip: any;
  billingaddress: any;
  billingcity: any;
  billingCountry: any;
  billingState: any;
  pin: string;
  OTP: string;
  loadAuthIframe: boolean;
  authUrl: any;
  isPin: boolean;
  isAvs: boolean;
  isGtb: boolean;
  suggestedAuth: any;
  isOtp: boolean;
  transaction_ref: any;

  constructor(
    private fb: FormBuilder,
    private paymentDataService: PaymentDataService,
    private router: Router,
    private notifyService: NotificationsService
  ) {
    this.PBFPubKey = environment.ravePubKey;
    this.currency = 'NGN';
    this.country = 'NG';
    this.amount = '10';
  }

  ngOnInit() {
    this.getCurrentUser();
    this.cardDetailsForm = this.fb.group({
      PBFPubKey: [''],
      cardno: [''],
      cvv: [''],
      expirymonth: [''],
      expiryyear: [''],
      currency: [''],
      country: [''],
      amount: [''],
      email: [''],
      firstname: [''],
      phonenumber: [''],
      txRef: [''],
      redirect_url: [''],
      billingzip: [''],
      billingcity: [''],
      billingaddress: [''],
      billingstate: [''],
      billingcountry: [''],
      suggested_auth: [''],
      pin: [''],
      OTP: ['']
    });

    this.generateReference();
  }

  navToHome() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([`${this.userRole}/home/${this.userId}`]);
  }

  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userName = user.userName;
    this.userId = user.id;
    this.userPhone = user.phoneNumber.substring(4);
    this.userEmail = user.email;
    this.userRole = user.role.toLowerCase();
    this.redirect = `http://localhost:4200/payment/${this.userId}`;
  }

  initiatePayment() {
    this.stringifyCardDetails();
    this.paymentDataService
      .getEncryptKey()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(key => {
        if (key) {
          const encryptionKey = key.encryptionKey;
          this.cardDetailsForm.patchValue({
            PBFPubKey: this.PBFPubKey,
            currency: this.currency,
            country: this.country,
            amount: this.amount,
            email: this.userEmail,
            firstname: this.userName,
            phonenumber: this.userPhone,
            txRef: this.tfx,
            redirect_url: this.redirect,
            cardno: this.cardno,
            expirymonth: this.expiryMonth,
            expiryyear: this.expiryYear,
            cvv: this.cvv
          });
          const payLoad = this.cardDetailsForm.value;
          this.paymentDataService
            .EncryptPaymentPayload(encryptionKey, payLoad)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(res => {
              if (res) {
                const paymentPayload = {
                  PBFPubKey: 'FLWPUBK_TEST-de83d2331a09f1d56894a397f1aab8ec-X',
                  client: res.encryptionData,
                  alg: '3DES-24'
                };
                this.paymentDataService
                  .makePayment(paymentPayload)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(payment => {
                    if (payment) {
                      this.paymentAuthCheck(payment);
                    }
                  });
              }
            });
        } else {
          return;
        }
      });

    console.log('payload', this.encryptedData);
  }

  stringifyCardDetails() {
    const cardno = this.cardDetailsForm.value.cardno;
    const expirymonth = this.cardDetailsForm.value.expirymonth;
    const expiryyear = this.cardDetailsForm.value.expiryyear;
    const cvv = this.cardDetailsForm.value.cvv;
    const billingZip = this.cardDetailsForm.value.billingzip;
    const billingaddress = this.cardDetailsForm.value.billingaddress;
    const billingcity = this.cardDetailsForm.value.billingcity;
    const billingCountry = this.cardDetailsForm.value.billingcountry;
    const billingState = this.cardDetailsForm.value.billingstate;

    this.cardno = JSON.stringify(cardno);
    this.expiryYear = JSON.stringify(expiryyear);
    this.cvv = JSON.stringify(cvv);
    this.expiryMonth = expirymonth;
    this.billingZip = billingZip;
    this.billingaddress = billingaddress;
    this.billingcity = billingcity;
    this.billingCountry = billingCountry;
    this.billingState = billingState;
  }

  initiateAvsAuth(auth) {
    this.cardDetailsForm.patchValue({
      PBFPubKey: this.PBFPubKey,
      currency: this.currency,
      country: this.country,
      amount: this.amount,
      email: this.userEmail,
      firstname: this.userName,
      phonenumber: this.userPhone,
      txRef: this.tfx,
      redirect_url: this.redirect,
      cardno: this.cardno,
      expirymonth: this.expiryMonth,
      expiryyear: this.expiryYear,
      cvv: this.cvv,
      billingzip: this.billingZip,
      billingaddress: this.billingaddress,
      billingcity: this.billingcity,
      billingcountry: this.billingCountry,
      billingState: this.billingState,
      suggested_auth: auth
    });

    this.paymentDataService
      .getEncryptKey()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(key => {
        if (key) {
          const payLoad = this.cardDetailsForm.value;
          this.paymentDataService
            .EncryptPaymentPayload(key, payLoad)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(res => {
              if (res) {
                const paymentPayload = {
                  PBFPubKey: 'FLWPUBK_TEST-de83d2331a09f1d56894a397f1aab8ec-X',
                  client: res.encryptionData,
                  alg: '3DES-24'
                };
                this.paymentDataService
                  .makePayment(paymentPayload)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(payment => {
                    if (payment) {
                      // const url = payment.authUrl;
                    }
                  });
              }
            });
        } else {
          return;
        }
      });
  }

  initiatePinAuth() {
    const pin = this.cardDetailsForm.value.pin;
    this.pin = JSON.stringify(pin);

    this.cardDetailsForm.patchValue({
      PBFPubKey: this.PBFPubKey,
      currency: this.currency,
      country: this.country,
      amount: this.amount,
      email: this.userEmail,
      firstname: this.userName,
      phonenumber: this.userPhone,
      txRef: this.tfx,
      redirect_url: this.redirect,
      cardno: this.cardno,
      expirymonth: this.expiryMonth,
      expiryyear: this.expiryYear,
      cvv: this.cvv,
      pin: this.pin,
      suggested_auth: this.suggestedAuth
    });

    this.paymentDataService
      .getEncryptKey()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(key => {
        if (key) {
          const payLoad = this.cardDetailsForm.value;
          this.paymentDataService
            .EncryptPaymentPayload(key.encryptionKey, payLoad)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(res => {
              if (res) {
                const paymentPayload = {
                  PBFPubKey: 'FLWPUBK_TEST-de83d2331a09f1d56894a397f1aab8ec-X',
                  client: res.encryptionData,
                  alg: '3DES-24'
                };
                this.paymentDataService
                  .makePayment(paymentPayload)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(payment => {
                    if (payment) {
                      this.transaction_ref = payment.data.flwRef;
                      this.isOtp = true;
                      this.isPin = false;
                    }
                  });
              }
            });
        } else {
          return;
        }
      });
  }

  validatePayment() {
    const otp = this.cardDetailsForm.value.OTP;
    this.OTP = JSON.stringify(otp);

    const authPayLoad = {
      PBFPubKey: this.PBFPubKey,
      transaction_reference: this.transaction_ref,
      otp: this.OTP
    };
    this.paymentDataService
      .validatePayment(authPayLoad)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        if (data.status === 'success') {
          this.notifyService.showSuccessMessage('Your Payment details has been saved in a secure vault.');
          this.isCard = false;
          this.isCash  = false;
          this.clearCardDetailsForm();
        }
      });
  }

  initiateGtbAtuh() {
    const authPayLoad = {
      PBFPubKey: this.PBFPubKey,
      transaction_reference: this.tfx,
      otp: this.OTP
    };
    this.paymentDataService
      .validatePayment(authPayLoad)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        console.log('pin payment response', data);
      });
  }

  loadIFrame(authurl) {
    this.loadAuthIframe = true;
    this.authUrl = authurl;
  }

  paymentAuthCheck(body) {
    if (
      body.status === 'success' &&
      body.data.suggested_auth === 'NOAUTH_INTERNATIONAL'
    ) {
      /*
      *card requires AVS authentication so you need to
      *1. Update payload with billing info - billingzip, billingcity, billingaddress, billingstate,
       billingcountry and the suggested_auth returned
      *2. Re-encrypt the payload
      *3. Call the charge endpoint once again with this updated encrypted payload
      */
      this.isGtb = false;
      this.isPin = false;
      this.isAvs = true;
      this.initiateAvsAuth(body.data.suggested_auth);
    } else if (
      body.status === 'success' &&
      body.data.suggested_auth === 'PIN'
    ) {
      /*
       *card requires pin authentication so you need to
       *1. Update payload with pin and the suggested_auth returned
       *2. Re-encrypt the payload
       *3. Call the charge endpoint once again with this updated encrypted payload
       */
      this.isGtb = false;
      this.isAvs = false;
      this.isPin = true;
      this.suggestedAuth = body.data.suggested_auth;
    } else if (
      body.status === 'success' &&
      body.data.suggested_auth === 'GTB_OTP'
    ) {
      /*
       *card requires OTP authentication so you need to
       *1. Collect OTP from user
       *2. Call Rave Validate endpoint
       */
      this.isAvs = false;
      this.isPin = false;
      this.isGtb = true;
      this.initiateGtbAtuh();
    } else if (body.status === 'success' && body.data.authurl !== 'N/A') {
      /*
       *card requires 3dsecure authentication so you need to
       *1. Load the authurl in an iframe for your user to complete the transaction
       */
      this.loadIFrame(body.data.authurl);
    } else {
      // an error has probably occurred.
    }
  }

  openCash() {
    this.isCash = !this.isCash;
  }
  openCard() {
    this.isCard = !this.isCard;
  }

  togglePaymentMethods() {
    this.isCard = false;
    this.isCash = false;
  }

  generateReference() {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      this.tfx = text;
      console.log(this.tfx);
    }
  }
  clearCardDetailsForm() {
    this.cardDetailsForm.markAsPristine();
    this.cardDetailsForm.markAsUntouched();
    this.cardDetailsForm.reset();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
