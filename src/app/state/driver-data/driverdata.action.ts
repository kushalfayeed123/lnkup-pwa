import { DriverData } from 'src/app/models/DriverData';

export class GetDriverData {
  static readonly type = '[DriverData] GetDriverData';

  constructor(public id: string) { }

}

export class CreateDriverData {
  static readonly type: '[DriverData] CreateDriverData';

  constructor(public driverData: DriverData) { }
}

export class UpdateDriverData {
  static readonly type: '[DriverData] UpdateDriverData';

  constructor(public id: string) { }
}
