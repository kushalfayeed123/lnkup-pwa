import { ActiveTrips } from '../models/ActiveTrips';
import { Selector, Action, StateContext, State } from '@ngxs/store';
import { ActiveTripDataService } from '../services/data/active-trip/active-trip.data.service';
import { GetTrips } from './trips.action';
import { tap } from 'rxjs/internal/operators/tap';

export class TripsStateModel {
  trips: ActiveTrips[];
  totalTrips: number;
}


@State<TripsStateModel>({
  name: 'trips',

  defaults: {
    trips: [],
    totalTrips: 0
  }
})

export class TripsState {


  @Selector()
  static getTrips(state: TripsStateModel) {
    return state.trips;
  }

  constructor(
    private TripsService: ActiveTripDataService
  ) {

  }

  @Action(GetTrips)
  getTrips(ctx: StateContext<TripsStateModel>) {
    return this.TripsService.getAllActiveTrips().pipe(
      tap(trips => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          trips,
          totalTrips: trips.length
        });

      },
        err => console.log(err.error))
    );
  }

}
