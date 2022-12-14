import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';


@Injectable()

export abstract class AuthenticateDataService {
    abstract login(username, password);
    abstract getAll(): Observable<Users[]>;
    abstract register(user);
    abstract update(user): Observable<any>;
    abstract delete(user);
    abstract logout();
    abstract getById(id): Observable<Users>;
    abstract getByEmail(email): Observable<Users>;
    abstract updateUserStatus(user);
    abstract decode();
    abstract getUserImage(id);
    abstract uploadUserImage(image);
    abstract updateUserImage(id, image);
    abstract sendEmail(payload): Observable<Users>;
}
