import { ActiveRiders } from './ActiveRider';

export class ActiveTrips {
  tripId: string;
  driverId: string;
  driverTripStatus: number;
  driverStartLongitude: string;
  driverStartLatitude: string;
  driverEndLongitude: string;
  driverEndLatitude: string;
  maxRiderNumber: number;
  tripStartDateTime: string;
  tripEndDateTime: string;
  departureDateTime: string;
  allowedRiderCount: number;
  tripType: string;
  pickupDistance: number;
  timeToPickup: string;
  tripPickup: string;
  tripDriver: any;
  tripConnectionId: string;
  tripPricePerRider: number;
  userDriverDestinationDistance: number;
  aggregrateTripFee: number;
  activeRiders: ActiveRiders[];
}
