import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { DriverData } from 'src/app/models/DriverData';


@Injectable()

export abstract class DriverDataDataService {

  abstract getAllDriverData(): Observable<DriverData[]>;
  abstract getDriverByDriverId(id): Observable<DriverData>;
  abstract createDriverData(driver): Observable<DriverData>;
  abstract updateDriverData(id, driver): Observable<DriverData>;
  abstract deleteDriverData(id);

}
