import { Selector, Action, StateContext, State, Store } from '@ngxs/store';
import { GetTrips, GetAvailableTrips, GetTripById, GetAllTrips, ShowEmptyTripMessage } from './trips.action';
import { tap } from 'rxjs/internal/operators/tap';
import { ActiveTrips } from 'src/app/models/ActiveTrips';
import { ActiveTripDataService } from 'src/app/services/data/active-trip/active-trip.data.service';
import { ShowLoader } from '../app/app.actions';
import { StateReset } from 'ngxs-reset-plugin';

export class TripsStateModel {
  trips: ActiveTrips[];
  availableTrips: ActiveTrips[];
  selectedTrip: ActiveTrips;
  allTrips: ActiveTrips[];
  emptyTrip: Boolean;
}


@State<TripsStateModel>({
  name: 'trips',

  defaults: {
    trips: [],
    availableTrips: [],
    selectedTrip: null,
    allTrips: [],
    emptyTrip: false,
  }
})

export class TripsState {


  @Selector()
  static getTrips(state: TripsStateModel) {
    return state.trips;
  }
  @Selector()
  static getAllTrips(state: TripsStateModel) {
    return state.allTrips;
  }
  @Selector()
  static getAvailableTrips(state: TripsStateModel) {
    return state.availableTrips;
  }

  @Selector()
  static getSelectedTrip(state: TripsStateModel) {
    return state.selectedTrip;
  }

  @Selector()
  static showEmptyTripMessage(state: TripsStateModel) {
    return state.emptyTrip;
  }



  constructor(
    private TripsService: ActiveTripDataService, private store: Store
  ) {

  }

  @Action(GetTrips)
  getTrips(ctx: StateContext<TripsStateModel>) {
    this.store.dispatch(new ShowLoader(true));
    // this.store.dispatch(new StateReset(TripsState));
    return this.TripsService.getAllActiveTrips().pipe(
      tap(trips => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          trips
        });
        this.store.dispatch(new ShowLoader(false));
      })
    );
  }

  @Action(GetAllTrips)
  getAllTrips(ctx: StateContext<TripsStateModel>) {
    this.store.dispatch(new ShowLoader(true));
    return this.TripsService.getAllTrips().pipe(
      tap(trips => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          allTrips: trips
        });
        this.store.dispatch(new ShowLoader(false));
      })
    );
  }

  @Action(GetAvailableTrips)
  getAvailableTrips(ctx: StateContext<TripsStateModel>, { availableTrips }: GetAvailableTrips) {
    this.store.dispatch(new ShowLoader(true));
    const state = ctx.getState();
    ctx.setState({
      ...state,
      availableTrips
    });
    this.store.dispatch(new ShowLoader(false));

  }

  @Action(GetTripById)
  getTripById(ctx: StateContext<TripsStateModel>, { id }: GetTripById) {
    this.store.dispatch(new ShowLoader(true));
    return this.TripsService.getTripsById(id).pipe(
      tap(trip => {
        this.store.dispatch(new ShowLoader(false));
        const state = ctx.getState();
        ctx.setState({
          ...state,
          selectedTrip: trip
        });
      })
    );
  }

  @Action(ShowEmptyTripMessage)
  showEmptyTripMessage(ctx: StateContext<TripsStateModel>, { emptyTrip }: ShowEmptyTripMessage) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      emptyTrip
    });
  }
}
