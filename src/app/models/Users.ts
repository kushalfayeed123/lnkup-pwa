import { UserPaymentToken } from './payment';
import { PushNotificationTokens } from './pushNotificationTokens';

export class Users{
    userId: string;
    userName: string;
    firstName: string;
    LastName: string;
    verificationCode: string;
    Role: string;
    userStatus: string;
    token: string;
    userImage: UserImage;
    userPaymentData: UserPaymentToken[];
    pushNotificationTokens: PushNotificationTokens[];
}

export class UserImage {
    imageId: string;
    image: string;
}
