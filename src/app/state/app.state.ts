import { Users } from '../models/Users';
import { Selector, State, StateContext, Action } from '@ngxs/store';
import { AuthenticateDataService } from '../services/data/authenticate.data.service';
import { SetPreviousRoute, ShowLoader, HideLoader, GetLoggedInUser, GetCurrentUser, ShowLeftNav } from './app.actions';
import { tap } from 'rxjs/internal/operators/tap';
import { Injectable } from '@angular/core';

export class AppStateModel {
  loggedInUser: any;
  currentUser: Users;
  showLoader: boolean;
  showLeftNav: boolean;
  previousRoute: string;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    currentUser: null,
    loggedInUser: null,
    showLoader: false,
    previousRoute: '',
    showLeftNav: false
  }
})

@Injectable()

export class AppState {


  @Selector()
  static getPreviousRoute(state: AppStateModel) {
    return state.previousRoute;
  }

  @Selector()
  static getCurrentUser(state: AppStateModel) {
    return state.currentUser;
  }

  @Selector()
  static getLoggedInUser(state: AppStateModel) {
    return state.loggedInUser;
  }

  @Selector()
  static showLeftNav(state: AppStateModel) {
    return state.showLeftNav;
  }

  @Selector()
  static showLoader(state: AppStateModel) {
    return state.showLoader;
  }


  constructor(private auth: AuthenticateDataService) {

  }

  @Action(SetPreviousRoute)
  SetPreviousRoute(ctx: StateContext<AppStateModel>, { route }: SetPreviousRoute) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      previousRoute: route
    });
  }

  @Action(ShowLoader)
  showLoader({ getState, setState }: StateContext<AppStateModel>) {
    const state = getState();
    setState({
      ...state,
      showLoader: true
    });
  }

  @Action(ShowLeftNav)
  showLeftNav(ctx: StateContext<AppStateModel>, { payload }: ShowLeftNav) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      showLeftNav: payload
    });
  }

  @Action(HideLoader)
  hideSpinner({ getState, setState }: StateContext<AppStateModel>) {
    const state = getState();
    setState({
      ...state,
      showLoader: false
    });
  }

  @Action(GetLoggedInUser)
  getLoggedInUser(ctx: StateContext<AppStateModel>, { user }: GetLoggedInUser) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loggedInUser: user
    });
  }

  @Action(GetCurrentUser)
  getCurrentUser(ctx: StateContext<AppStateModel>, { id }: GetCurrentUser) {
    return this.auth.getById(id).pipe(
      tap(currentUser => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          currentUser
        });
      })
    );
  }
}




