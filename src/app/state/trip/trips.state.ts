import { Selector, Action, StateContext, State, Store } from '@ngxs/store';
import { GetTrips, GetAvailableTrips, GetTripById } from './trips.action';
import { tap } from 'rxjs/internal/operators/tap';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { ShowLoader } from '../app/app.actions';

export class TripsStateModel {
  trips: ActiveTrips[];
  availableTrips: ActiveTrips[];
  selectedTrip: ActiveTrips;
}


@State<TripsStateModel>({
  name: 'trips',

  defaults: {
    trips: [],
    availableTrips: [],
    selectedTrip: null,
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

  @Selector()
  static getSelectedTrip(state: TripsStateModel) {
    return state.selectedTrip;
  }



  constructor(
    private TripsService: ActiveTripDataService, private store: Store
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

  @Action(GetTripById)
  getTripById(ctx: StateContext<TripsStateModel>, { id }: GetTripById) {
    this.store.dispatch(new ShowLoader(true));
    return this.TripsService.getTripsById(id).pipe(
      tap(trip => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          selectedTrip: trip
        });
        this.store.dispatch(new ShowLoader(false));
      })
    );
  }



}
