import { Marker } from './Marker';

export class Location {
    lat: number;
    lng: number;
    viewport?: object;
    zoom: number;
    address_level_1?: string;
    address_level_2?: string;
    origin_address?: string;
    destination_address?: string;
    address_country?: string;
    address_zip?: string;
    address_state?: string;
    marker?: Marker;
  }

export class UserLocation {
    pickupId: string;
    userId: string;
    pickupLongitude: string;
    pickupLatitude: string;
    userRole: string;
  }
