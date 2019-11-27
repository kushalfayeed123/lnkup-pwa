import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { environment } from 'src/environments/environment';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { DriverDataDataService } from './driver-data.data.service';
import { DriverData } from 'src/app/models/DriverData';
import { DriverLicense } from 'src/app/models/DriverLicense';


@Injectable({ providedIn: 'root' })

export class DriverDataWebService implements DriverDataDataService {
  
   


  public webUrl: string;


  constructor(private http: HttpClient) {

    this.webUrl = environment.webUrl;

  }



 
  // getTripsById(id: any) {
  //   return this.http.get<ActiveTrips>(`${this.webUrl}/ActiveTrip/${id}`);
  // }

  // createTrip(trips: any) {
  //   return this.http.post<any>(`${this.webUrl}/ActiveTrip`, trips);
  // }
  // updateTrip(id: any, trips: any) {
  //   return this.http.put<ActiveTrips>(`${this.webUrl}/ActiveTrip/${id}`, trips);
  // }
  // deleteTrips(id: any) {
  //   return this.http.delete(`${this.webUrl}/ActiveTrip`, id);
  // }


  getAllDriverData() {
    return this.http.get<DriverData[]>(`${this.webUrl}/driverdata`);
    }
  getDriverByDriverId(id: any) {
    return this.http.get<DriverData>(`${this.webUrl}/driverdata/${id}`);
    }
  createDriverData(driver: DriverData) {
    return this.http.post<DriverData>(`${this.webUrl}/driverdata`, driver);
    }
  updateDriverData(id: any, driver: DriverData) {
    return this.http.put<DriverData>(`${this.webUrl}/driverdata/${id}`, driver);
    }
  deleteDriverData(id: any) {
    return this.http.delete(`${this.webUrl}/driverdata`, id);

    }

    getAllLicense() {
      return this.http.get<DriverLicense[]>(`${this.webUrl}/license`);
    }
    getLicenseByDriverId(id: string) {
      return this.http.get<DriverLicense>(`${this.webUrl}/license/${id}`);
    }
    uploadDriverLicense(license: any) {
      return this.http.post<DriverLicense>(`${this.webUrl}/license`, license);
    }
    updateDriverLicense(id: string, license: DriverLicense) {
      return this.http.put<DriverLicense>(`${this.webUrl}/license/${id}`, license);
    }
    deleteDriverLicense(id: any) {
      return this.http.delete(`${this.webUrl}/license`, id);
    }


}
