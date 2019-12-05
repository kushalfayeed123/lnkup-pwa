import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { environment } from 'src/environments/environment';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { DriverData } from 'src/app/models/DriverData';
import { DriverLicense } from 'src/app/models/DriverLicense';
import { PaymentDataService } from './payment.data.service';
import { Payment, UserPaymentToken, EncryptedPayment, ValidatePayment } from 'src/app/models/payment';


@Injectable({ providedIn: 'root' })

export class PaymentWebService implements PaymentDataService {



    public webUrl: string;
    public raveUrl: string;
    validateUrl: string;
    constructor(private http: HttpClient) {
        this.webUrl = environment.webUrl;
        this.raveUrl = environment.raveEndpoint;
        this.validateUrl = environment.raveValidateEndpoint;
    }

    // verify(verifyPayment: any) {
    //     return this.http.post<VerifyPayment>(`${this.webUrl}/payment/verify`, verifyPayment);
    // }
    create(payment: any) {
        return this.http.post<UserPaymentToken>(`${this.webUrl}/payment`, payment);
    }
    getAllPayments() {
        return this.http.get<UserPaymentToken[]>(`${this.webUrl}/payment`);
    }
    getPaymentById(paymentId: any) {
        return this.http.get<UserPaymentToken>(`${this.webUrl}/payment/${paymentId}`);

    }
    updatePayment(paymentId: any, payment: any) {
        return this.http.put<UserPaymentToken>(`${this.webUrl}/payment/${paymentId}`, payment);
    }
    delete(paymentId: any) {
        return this.http.delete<UserPaymentToken>(`${this.webUrl}/payment/${paymentId}`);
    }

    getEncryptKey() {
        return this.http.get<Payment>(`${this.webUrl}/encrypt/getKey`);
    }
    EncryptPaymentPayload(key: string, payment: any) {
        return this.http.post<any>(`${this.webUrl}/encrypt/${key}`, payment);
    }

    makePayment(encryptedPayload: any) {
        return this.http.post<EncryptedPayment>(`${this.raveUrl}`, encryptedPayload);
    }

    validatePayment(payload: any) {
       return this.http.post<ValidatePayment>(`${this.validateUrl}`, payload);
    }

    redirect() {
      return this.http.get<any>(`${this.webUrl}/redirect`);
    }
}
