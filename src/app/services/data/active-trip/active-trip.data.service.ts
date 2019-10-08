import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActiveTrips } from 'src/app/models/ActiveTrips';


@Injectable()

export abstract class ActiveTripDataService {

  abstract getAllActiveTrips(status): Observable<ActiveTrips[]>;
  abstract getTripsById(id): Observable<ActiveTrips>;
  abstract createTrip(trips): Observable<any>;
  abstract updateTrip(id, trips): Observable<ActiveTrips>;
  abstract deleteTrips(id);
  abstract sendNotification(id: string, message: string);
  abstract sendDeclineNotification(id: string, message: string);
}
