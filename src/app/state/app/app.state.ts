import { Selector, State, StateContext, Action, Store } from '@ngxs/store';
import { SetPreviousRoute, ShowLoader, GetLoggedInUser, GetCurrentUser, ShowLeftNav, GetUserByEmail } from './app.actions';
import { tap } from 'rxjs/internal/operators/tap';
import { Injectable } from '@angular/core';
import { Users } from 'src/app/models/Users';
import { AuthenticateDataService } from 'src/app/services/data/authenticate.data.service';

export class AppStateModel {
  loggedInUser: any;
  currentUser: Users;
  showLoader: boolean;
  showLeftNav: boolean;
  previousRoute: string;
  userByEmail: any;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    currentUser: null,
    loggedInUser: null,
    showLoader: false,
    previousRoute: '',
    showLeftNav: false,
    userByEmail: null,
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
  static getUserByEmail(state: AppStateModel) {
    return state.userByEmail;
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


  constructor(private auth: AuthenticateDataService, private store: Store) {

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
  showLoader(ctx: StateContext<AppStateModel>, { showLoader }: ShowLoader) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      showLoader
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

  @Action(GetUserByEmail)
  getUserByEmail(ctx: StateContext<AppStateModel>, { email }: GetUserByEmail) {
    return this.auth.getByEmail(email).pipe(
      tap(user => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          userByEmail: user
        });
      })
    );
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




