import { UserPaymentToken } from './payment';
import { PushNotificationTokens } from './pushNotificationTokens';

export class Users {
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    verificationCode: string;
    email: string;
    role: string;
    userStatus: string;
    token: string;
    phoneNumber: string;
    password: string;
    signupDate: string;
    signupTime: string;
    imageUrl: string;
    userPaymentData: UserPaymentToken[];
    pushNotificationTokens: PushNotificationTokens[];
}

export class UserImage {
    imageId: string;
    image: string;
}
