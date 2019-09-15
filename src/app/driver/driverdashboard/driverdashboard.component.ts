import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ErrorMessageComponent } from 'src/app/components/error-message/error-message.component';
import { MatSnackBar } from '@angular/material';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { Users } from 'src/app/models/Users';

@Component({
  selector: 'app-dashboard',
  templateUrl: './driverdashboard.component.html',
  styleUrls: ['./driverdashboard.component.scss']
})
export class DriverdashboardComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  durationInSeconds = 4;
  activeTripForm: FormGroup;
  loading: boolean;
  activeUser: ActiveTrips;
  activeTrip: any;

  constructor(private router: Router,
              private activeTripService: ActiveTripDataService,
              private fb: FormBuilder,
              private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.activeTripForm = this.fb.group([

    ]);
  }

  createTrip() {
    this.activeTripService.CreateTrip(this.activeTripForm.value)
    .pipe(takeUntil(this.unsubscribe$))
    .subcribe(trip =>  {
      this.activeTrip = trip;
      localStorage.setItem('activeTripId', this.activeTrip.tripId);
      alert('Trip has been created');
    }, error => {
      setTimeout(() => {
        this.loading = false;
        this.openErrorMessage();
      }, 3000);
    });

  }

  getActiveTripById() {
    const activeTripId = localStorage.getItem('activeTripId');
    this.activeTripService.getTripsById(activeTripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subcribe(response => {
      this.activeTrip = response;
    });
  }

  AcceptRiderRequest() {
    this.updateActiveTrip();
  }

  updateActiveTrip() {
    this.getActiveTripById();
    const activeTrip = this.activeTrip;
    const activeTripRider = this.activeTrip.activeRiders;
    const allowedRiderCount = activeTripRider.length;
    const activeTripId = activeTrip.activeTripId;

    const newActiveTrip = {
      driverTripStatus: activeTrip.driverTripStatus,
      allowedRiderCount,
      driverStartLat: activeTrip.driverStartLat,
      driverStartLng: activeTrip.driverStartLng,
      driverEndLat: activeTrip.driverEndLat,
      driverEndLng: activeTrip.driverEndLng
    };

    this.activeTripService.UpdateTrip(newActiveTrip, activeTripId)
    .pipe(takeUntil(this.unsubscribe$))
    .subcribe(response => {
      this.getActiveTripById();
    });
  }
  openErrorMessage() {
    this._snackBar.openFromComponent(ErrorMessageComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['dark-snackbar-error']
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
