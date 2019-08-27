import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { ActiveTripDataService } from './active-trip.data.service';
import { environment } from 'src/environments/environment';


@Injectable({ providedIn: 'root' })

export class ActiveTripWebService implements ActiveTripDataService {


  public webUrl: string;


  constructor(private http: HttpClient) {

    this.webUrl = environment.webUrl;

  }



  getAllActiveTrips(ActiveTripStatus) {
    const param = {status: ActiveTripStatus};
    return this.http.get(`${this.webUrl}/ActiveTrip`, ({params: param}));
  }
  getTripsById(id: any) {
    return this.http.get(`${this.webUrl}/ActiveTrip/${id}`);
  }

  CreateTrip(trips: any) {
    return this.http.post(`${this.webUrl}/ActiveTrip`, trips);
  }
  UpdateTrip(id: any, trips: any) {
    return this.http.put(`${this.webUrl}/ActiveTrip/${id}`, trips);
  }
  DeleteTrips(id: any) {
    return this.http.delete(`${this.webUrl}/ActiveTrip`, id);
  }


}
