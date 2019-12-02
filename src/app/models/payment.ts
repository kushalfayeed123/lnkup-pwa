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

export class VerifyPayment {
    txRef: string;
    secKey: string;
    amount: number;
}

export class EncryptedPayment {
    pbfPubKey: string;
    client: string;
    alg: string;
}

export class UserPaymentToken {
    userId: string;
    paymentToken: string;
}
