import { DriverData } from 'src/app/models/DriverData';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { DriverDataDataService } from 'src/app/services/data/driver-data/driver-data.data.service';
import { GetDriverData } from './driverdata.action';
import { tap } from 'rxjs/internal/operators/tap';

export class DriverDataStatemodel {

  driverData: DriverData;
}

@State<DriverDataStatemodel>({
  name: 'driverdata',
  defaults: {
    driverData: null
  }
})

@Injectable()
export class DriverState {


  @Selector()
  static getDriverData(state: DriverDataStatemodel) {
    return state.driverData;
  }

  @Selector()
  static createDriverData(state: DriverDataStatemodel) {
    return state.driverData;
  }

  @Selector()
  static updateDriverData(state: DriverDataStatemodel) {
    return state.driverData;
  }


  constructor(private driverService: DriverDataDataService) { }

  @Action(GetDriverData)
  getDriverData(ctx: StateContext<DriverDataStatemodel>, { id }: GetDriverData) {
    return this.driverService.getDriverByDriverId(id).pipe(
      tap(data => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          driverData: data
        });
      })
    );
  }


}

