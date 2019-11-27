import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { DriverData } from 'src/app/models/DriverData';
import { DriverLicense } from 'src/app/models/DriverLicense';


@Injectable()

export abstract class DriverDataDataService {

  abstract getAllDriverData(): Observable<DriverData[]>;
  abstract getDriverByDriverId(id): Observable<DriverData>;
  abstract createDriverData(driver): Observable<DriverData>;
  abstract updateDriverData(id, driver): Observable<DriverData>;
  abstract deleteDriverData(id);


  abstract getAllLicense(): Observable<DriverLicense[]>;
  abstract getLicenseByDriverId(id: string): Observable<DriverLicense>;
  abstract uploadDriverLicense(license): Observable<DriverLicense>;
  abstract updateDriverLicense(id: string, license: DriverLicense): Observable<DriverLicense>;
  abstract deleteDriverLicense(id);

}
