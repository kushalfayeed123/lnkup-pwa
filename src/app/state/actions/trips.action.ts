import { ActiveTrips } from 'src/app/models/ActiveTrips';

export class CreateTrip {
  static readonly type = '[Trip] create';

  constructor(public payload: ActiveTrips) {

  }
}
export class GetTrip {
  static readonly type = '[Trip] Get';
}

export class UpdateTrip {
  static readonly type = '[Trip] Update';

  constructor(public payload: ActiveTrips, public id: string) {

  }
}

export class DeleteTrip {
  static readonly type = '[Trip] Delete';

  constructor(public id: string) {
  }
}
