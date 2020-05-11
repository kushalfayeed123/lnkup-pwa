import { Selector, State, StateContext, Action, Store } from '@ngxs/store';
import { SetPreviousRoute, ShowLoader, GetLoggedInUser, GetCurrentUser, ShowLeftNav, GetUserByEmail, SetCurrentRoute, ShowBackButton, NavToTripSearch } from './app.actions';
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
  userByEmail: Users;
  currentRoute: any;
  showBackButton: any;
  navToSearch: boolean;
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
    currentRoute: null,
    showBackButton: null,
    navToSearch: false,
  }
})

@Injectable()

export class AppState {


  @Selector()
  static getPreviousRoute(state: AppStateModel) {
    return state.previousRoute;
  }
  @Selector()
  static getCurrenRoute(state: AppStateModel) {
    return state.currentRoute;
  }
  @Selector()
  static navToSearch(state: AppStateModel) {
    return state.navToSearch;
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
  static showBackButton(state: AppStateModel) {
    return state.showBackButton;
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

  @Action(SetCurrentRoute)
  SetCurrentRoute(ctx: StateContext<AppStateModel>, { route }: SetCurrentRoute) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      currentRoute: route
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

  @Action(ShowBackButton)
  showBackButton(ctx: StateContext<AppStateModel>, { showButton }: ShowBackButton) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      showBackButton: showButton,
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

  @Action(NavToTripSearch)
  navToTripSearch(ctx: StateContext<AppStateModel>, { navToSearch }: NavToTripSearch) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      navToSearch
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




