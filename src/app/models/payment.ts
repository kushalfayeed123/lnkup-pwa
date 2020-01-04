import { Users } from './Users';

export class Payment {
    userId: string;
    cardno: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
    currency: string;
    country: string;
    amount: string;
    encryptionKey: string;
    redirectUrl: string;
    txRef: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
}

export class ValidatePayment {
    PBFPubKey: string;
    transaction_reference: string;
    otp: number;
}

export class EncryptedPayment {
    pbfPubKey: string;
    encryptionData: string;
    alg: string;
}

export class UserPaymentToken {
    userId: string;
    paymentToken: string;
}

export class TokenizedPayment {
    SECKEY: string;
    token: string;
    currency: string;
    amount: string;
    email: string;
    txRef: string;
    status: string;
}

export class PaymentMethod {
    payment: string;
}
