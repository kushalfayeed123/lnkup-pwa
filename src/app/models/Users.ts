import { UserPaymentToken } from './payment';

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
}

export class UserImage {
    imageId: string;
    image: string;
}
