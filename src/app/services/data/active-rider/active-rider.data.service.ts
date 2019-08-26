import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';


@Injectable()

export abstract class ActiveRiderDataService{

    abstract update(activetrip);
    abstract delete(id);
    abstract create(activetrip);
    abstract get();
    abstract getById(id);
    abstract getAllTrips();
}
