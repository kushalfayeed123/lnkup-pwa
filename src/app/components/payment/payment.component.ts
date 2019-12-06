import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';
import { NotificationsService } from './../../services/business/notificatons.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { PaymentInstance, RaveOptions } from 'angular-rave';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PaymentDataService } from 'src/app/services/data/payment/payment.data.service';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Payment } from 'src/app/models/payment';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentInstance: PaymentInstance;
  token: string;
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
  paymentToken: any;

  constructor(
    private fb: FormBuilder,
    private paymentDataService: PaymentDataService,
    private router: Router,
    private notifyService: NotificationsService,
    public sanitizer: DomSanitizer,
    private authService: AuthenticateDataService
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
    this.redirect =
      'https://linkup20191021111853.azurewebsites.net/api/redirect';
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

    this.cardno = JSON.stringify(cardno);
    this.expiryYear = JSON.stringify(expiryyear);
    this.cvv = JSON.stringify(cvv);
    this.expiryMonth = expirymonth;
  }

  initiateAvsAuth() {
    const billingZip = this.cardDetailsForm.value.billingzip;
    const billingaddress = this.cardDetailsForm.value.billingaddress;
    const billingcity = this.cardDetailsForm.value.billingcity;
    const billingCountry = this.cardDetailsForm.value.billingcountry;
    const billingState = this.cardDetailsForm.value.billingstate;
    this.billingZip = billingZip;
    this.billingaddress = billingaddress;
    this.billingcity = billingcity;
    this.billingCountry = billingCountry;
    this.billingState = billingState;

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
                      const url = payment.data.authurl;
                      this.loadIFrame(url);
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
          this.isCard = false;
          this.isCash = false;
          this.clearCardDetailsForm();
          const paymentToken = data.data.tx.chargeToken.embed_token;
          this.saveCardToken(paymentToken);
        }
      });
  }
  loadIFrame(authurl) {
    this.authUrl = authurl;
    this.loadAuthIframe = true;
    this.paymentDataService
      .redirect()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        console.log('response from iframe', res);
      });
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
      this.isOtp = false;
      this.isPin = false;
      this.isAvs = true;
      this.suggestedAuth = body.data.suggested_auth;
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
      this.isOtp = false;
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
      this.isOtp = true;
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

  saveCardToken(token) {
    this.authService.getById(this.userId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(user => {
      if (user.userPaymentData === null) {
        const cardDetails = {
          userId: this.userId,
          paymentToken: token
        };
        this.paymentDataService
          .create(cardDetails)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(res => {
            this.notifyService.showSuccessMessage(
              'Your Payment details has been saved in a secure vault.'
            );
          });
      } else {
        this.updateCardToken(token);
      }
    });
  }

  updateCardToken(token) {
    this.authService
      .getById(this.userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        // const userPaymentData = res.userPayment.paymentToken;
        // if (userPaymentData === token) {

        // }
        console.log('payment response', res);
      });
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
