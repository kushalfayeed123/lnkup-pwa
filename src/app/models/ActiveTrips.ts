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
  userDriverDestinationDistance: number;
  activeRiders: ActiveRiders[];
}
