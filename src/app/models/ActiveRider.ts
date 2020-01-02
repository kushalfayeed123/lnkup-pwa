import { User } from 'firebase';

export class ActiveRiders {
    riderId: string;
    tripId: string;
    userId: string;
    tripFee: number;
    pickupId: string;
    tripStatus: string;
    currentLocationLongitude: number;
    currentLocationLatitude: number;
    destinationLongitude: number;
    destinationLatitude: number;
    user: User;
}
