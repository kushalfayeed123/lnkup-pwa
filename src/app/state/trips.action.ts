import { ActiveTrips } from 'src/app/models/ActiveTrips';

export class CreateTrip {
  static readonly type = '[Trips] create';

  constructor(public payload: ActiveTrips) {

  }
}
export class GetTrips {
  static readonly type = '[Trips] GetTrips';

  constructor(public allTrips: ActiveTrips[]) { }
}

export class GetTripById {
  static readonly type = '[Trips] GetById';

  constructor(public payload: ActiveTrips, public id: ActiveTrips) {

  }
}

export class UpdateTrip {
  static readonly type = '[Trips] Update';

  constructor(public payload: ActiveTrips, public id: string) {

  }
}

export class DeleteTrip {
  static readonly type = '[Trips] Delete';

  constructor(public id: string) {
  }
}
