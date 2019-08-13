import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';


@Injectable()

export abstract class AuthenticateDataService{
    abstract login(username, password);
    abstract getAll(): Observable<Users[]>;
    abstract register(user);
    abstract update(user);
    abstract delete(user);
    abstract logout();
    abstract getById(id): Observable<Users>;
    abstract get currentUserValue();
    abstract decode();
}