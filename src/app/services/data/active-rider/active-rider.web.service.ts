
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActiveRiderDataService } from './active-rider.data.service';
import { environment } from 'src/environments/environment';
import { ActiveRiders } from 'src/app/models/ActiveRider';




@Injectable({ providedIn: 'root' })
export class ActiveRiderWebService implements ActiveRiderDataService {
    public webUrl: string;

    constructor(private http: HttpClient) {
        this.webUrl = environment.webUrl;

    }

    update(activetrip: any) {
        return this.http.put(`${this.webUrl}/ActiveRiders/activetrip.Id`, activetrip);
    }
    delete(id: any) {
        return this.http.delete(`${this.webUrl}/ActiveRiders`, id);
    }
    create(activetrip: any) {
        return this.http.post(`${this.webUrl}/ActiveRiders`, activetrip);
    }
    get() {
        return this.http.get<ActiveRiders[]>(`${this.webUrl}/ActiveRiders`);
    }
    getById(id: any) {
        return this.http.get<ActiveRiders[]>(`${this.webUrl}/ActiveRiders`, id);
    }

    getAllTrips() {
        return this.http.get(`${this.webUrl}/ActiveTrips`);
    }
}
