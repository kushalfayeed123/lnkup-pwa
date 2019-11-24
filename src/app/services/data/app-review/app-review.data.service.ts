import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { AppReview } from 'src/app/models/AppReview';


@Injectable()

export abstract class AppReviewDataService {

  abstract getAllReviews(): Observable<AppReview[]>;
  abstract getReviewByUserId(id): Observable<AppReview>;
  abstract createReview(review): Observable<AppReview>;
  abstract updateReview(id, review): Observable<AppReview>;
  abstract deleteReview(id);
 
}
