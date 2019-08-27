import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()

export abstract class ActiveTripDataService {

  abstract getAllActiveTrips(status);
  abstract getTripsById(id);
  abstract CreateTrip(trips);
  abstract UpdateTrip(id, trips);
  abstract DeleteTrips(id);

}
