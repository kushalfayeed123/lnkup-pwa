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
    txref: 'ksdfdshd8487djd',
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

  constructor(private fb: FormBuilder,
              private paymentDataService: PaymentDataService,
              private _router: Router) {
    this.PBFPubKey = 'FLWPUBK_TEST-de83d2331a09f1d56894a397f1aab8ec-X';
    this.currency = 'NGN';
    this.country = 'NG';
    this.amount = '10';
  }

  ngOnInit() {
    this.getCurrentUser();
    this.cardDetailsForm = this.fb.group({
      userId: ['', [Validators.required]],
      PBFPubKey: ['', [Validators.required]],
      cardno: ['', [Validators.required]],
      cvv: ['', [Validators.required]],
      expirymonth: ['', [Validators.required]],
      expiryyear: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      country: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      email: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      phonenumber: ['', [Validators.required]],
      txRef: ['', [Validators.required]],
      redirect_url: ['', [Validators.required]],
      encryptionKey: ['', [Validators.required]],

    });

    this.generateReference();
  }

  navToHome() {
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    this._router.onSameUrlNavigation = 'reload';
    this._router.navigate([`${this.userRole}/home/${this.userId}`]);
  }

  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userName = user.userName;
    this.userId = user.id;
    this.userPhone = user.phoneNumber;
    this.userEmail = user.email;
    this.userRole = user.role;
    this.redirect = `http://localhost:4200/payment/${this.userId}`;
  }

  initiatePayment() {
    this.stringifyCardDetails();
    this.paymentDataService.getEncryptKey()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(key => {
      if (key) {
        const encryptionKey = key.encryptionKey;
        this.cardDetailsForm.patchValue({
          userId: this.userId,
          PBFPubKey: 'FLWPUBK_TEST-de83d2331a09f1d56894a397f1aab8ec-X',
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
          encryptionKey
        });
        const payLoad = this.cardDetailsForm.value;
        this.paymentDataService.EncryptPaymentPayload(payLoad)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(res => {
          if (res) {
            const paymentPayload = {
              PBFPubKey: 'FLWPUBK_TEST-de83d2331a09f1d56894a397f1aab8ec-X',
              client: res.encryptionData,
              alg: '3DES-24'
            };
            this.paymentDataService.makePayment(paymentPayload)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(payment => {
              if (payment) {
                console.log('payment', payment);
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
    this.expiryMonth = JSON.stringify(expirymonth);
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
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      this.tfx = text;
      console.log(this.tfx);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

