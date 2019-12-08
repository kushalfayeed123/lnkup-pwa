import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { Payment, UserPaymentToken, EncryptedPayment, ValidatePayment, TokenizedPayment } from 'src/app/models/payment';


@Injectable()

export abstract class PaymentDataService {
    abstract create(payment): Observable<UserPaymentToken>;
    abstract getAllPayments(): Observable<UserPaymentToken[]>;
    abstract getPaymentById(paymentId): Observable<UserPaymentToken>;
    abstract getSecKey(): Observable<any>;
    abstract updatePayment(paymentId, payment): Observable<UserPaymentToken>;
    abstract delete(paymentId): Observable<UserPaymentToken>;
    abstract getEncryptKey(): Observable<Payment>;
    abstract EncryptPaymentPayload(key, payment): Observable<any>;
    abstract makePayment(encryptedPayload): Observable<any>;
    abstract validatePayment(payload): Observable<any>;
    abstract redirect(): Observable<any>;
    abstract tokenizedPayment(payload): Observable<any>;
}
