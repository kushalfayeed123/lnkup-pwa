import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { ActiveTripDataService } from './active-trip.data.service';
import { environment } from 'src/environments/environment';
import { ActiveTrips } from 'src/app/models/ActiveTrips';


@Injectable({ providedIn: 'root' })

export class ActiveTripWebService implements ActiveTripDataService {


  public webUrl: string;


  constructor(private http: HttpClient) {

    this.webUrl = environment.webUrl;

  }



  getAllActiveTrips(ActiveTripStatus)  {
    const param = {status: ActiveTripStatus};
    return this.http.get<ActiveTrips[]>(`${this.webUrl}/ActiveTrip`, ({params: param}));
  }
  getTripsById(id: any) {
    return this.http.get<ActiveTrips>(`${this.webUrl}/ActiveTrip/${id}`);
  }

  createTrip(trips: any) {
    return this.http.post<any>(`${this.webUrl}/ActiveTrip`, trips);
  }
  updateTrip(id: any, trips: any) {
    return this.http.put<ActiveTrips>(`${this.webUrl}/ActiveTrip/${id}`, trips);
  }
  deleteTrips(id: any) {
    return this.http.delete(`${this.webUrl}/ActiveTrip`, id);
  }

  sendNotification(id: any, clientMessage: string) {
    const param = {message: clientMessage};
    return this.http.get(`${this.webUrl}/message/${id}`, ({params: param}));
  }


}
