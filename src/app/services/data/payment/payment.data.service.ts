import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { Payment, VerifyPayment, UserPaymentToken, EncryptedPayment } from 'src/app/models/payment';


@Injectable()

export abstract class PaymentDataService {
    abstract verify(verifyPayment): Observable<VerifyPayment>;
    abstract create(payment): Observable<UserPaymentToken>;
    abstract getAllPayments(): Observable<UserPaymentToken[]>;
    abstract getPaymentById(paymentId): Observable<UserPaymentToken>;
    abstract updatePayment(paymentId, payment): Observable<UserPaymentToken>;
    abstract delete(paymentId): Observable<UserPaymentToken>;

    abstract getEncryptKey(): Observable<Payment>;
    abstract EncryptPaymentPayload(payment): Observable<Payment>;

    abstract makePayment(encryptedPayload): Observable<EncryptedPayment>;
}
