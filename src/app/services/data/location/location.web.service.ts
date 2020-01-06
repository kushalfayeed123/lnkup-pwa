import { LocationDataService } from './location.data.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserLocation } from 'src/app/models/Location';



@Injectable({ providedIn: 'root' })
export class LocationWebService implements LocationDataService {

    public webUrl: string;

    constructor(private http: HttpClient) {
        this.webUrl = environment.webUrl;

    }

    update(id: any, location: any) {
        return this.http.put<UserLocation>(`${this.webUrl}/location/${id}`, location);
    }
    delete(id: any) {
        return this.http.delete(`${this.webUrl}/location/${id}`);
    }
    create(location: any) {
        return this.http.post<UserLocation>(`${this.webUrl}/location`, location);
    }
    getLocationsByUserId(id: any) {
        return this.http.get<UserLocation>(`${this.webUrl}/location/${id}`);
    }
    getAllLocations() {
        return this.http.get<UserLocation[]>(`${this.webUrl}/location`);
    }
} 

