import { Injectable } from '@angular/core';



@Injectable()

export abstract class ActiveRiderDataService {

    abstract update(activetrip, id);
    abstract delete(id);
    abstract create(activetrip);
    abstract get();
    abstract getById(id);
    abstract getAllTrips();
}
