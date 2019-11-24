import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from 'src/app/models/Users';
import { environment } from 'src/environments/environment';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { AppReviewDataService } from './app-review.data.service';
import { AppReview } from 'src/app/models/AppReview';


@Injectable({ providedIn: 'root' })

export class AppReviewWebService implements AppReviewDataService {


    public webUrl: string;


    constructor(private http: HttpClient) {

        this.webUrl = environment.webUrl;

    }

    getAllReviews() {
        return this.http.get<AppReview[]>(`${this.webUrl}/Review`);
    }
    getReviewByUserId(id: string) {
        return this.http.get<AppReview>(`${this.webUrl}/Review/${id}`);
    }
    createReview(review: AppReview) {
        return this.http.post<AppReview>(`${this.webUrl}/Review`, review);
    }
    updateReview(id: string, review: AppReview) {
        return this.http.put<AppReview>(`${this.webUrl}/Review/${id}`, review);
    }
    deleteReview(id: string) {
        return this.http.delete(`${this.webUrl}/Review/${id}`);
    }
}
