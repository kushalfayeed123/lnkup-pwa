import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { UserLocation } from 'src/app/models/Location';



@Injectable()

export abstract class LocationDataService {

    abstract update(id, location): Observable<UserLocation>;
    abstract delete(id);
    abstract create(location): Observable<UserLocation>;
    abstract getLocationsByUserId(id): Observable<UserLocation>;
    abstract getAllLocations(): Observable<UserLocation[]>;
}
