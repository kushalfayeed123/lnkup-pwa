import { Users } from './Users';

export class ActiveRiders {
    activeRiderId: string;
    tripId: string;
    userId: string;
    tripFee: number;
    pickupId: string;
    tripStatus: string;
    currentLocationLongitude: number;
    currentLocationLatitude: number;
    destinationLongitude: number;
    destinationLatitude: number;
    user: Users;
    paymentType: string;
    riderConnectId: string;
}
