import { Selector, Action, StateContext, State } from '@ngxs/store';
import { GetTrips, GetAvailableTrips } from './trips.action';
import { tap } from 'rxjs/internal/operators/tap';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';

export class TripsStateModel {
  trips: ActiveTrips[];
  availableTrips: ActiveTrips[];
}


@State<TripsStateModel>({
  name: 'trips',

  defaults: {
    trips: [],
    availableTrips: [],
  }
})

export class TripsState {


  @Selector()
  static getTrips(state: TripsStateModel) {
    return state.trips;
  }

  @Selector()
  static getAvailableTrips(state: TripsStateModel) {
    return state.availableTrips;
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
          trips
        });
      })
    );
  }

  @Action(GetAvailableTrips)
  getAvailableTrips(ctx: StateContext<TripsStateModel>, { availableTrips }: GetAvailableTrips) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      availableTrips
    });
  }

}
