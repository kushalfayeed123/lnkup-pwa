import { Component, OnInit } from '@angular/core';
import { PaymentInstance, RaveOptions } from 'angular-rave';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

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

  constructor() { }

  ngOnInit() {
  }

  paymentFailure() {
    console.log('Payment Failed');
  }

  paymentSuccess(res) {
    console.log('Payment complete', res);
    this.paymentInstance.close();
  }

  paymentInit(paymentInstance) {
    this.paymentFailure = paymentInstance;
    console.log('Payment about to begin', paymentInstance);
  }
}

