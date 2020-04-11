import { Users } from '../models/Users';

export class ShowLeftNav {
  static readonly type = '[App] ShowLeftNav';

  constructor(public payload: boolean) {

  }
}

export class SetPreviousRoute {
  static readonly type = '[App] SetPreviousRoute';

  constructor(public route: string) { }
}

export class ShowLoader {
  static readonly type = '[App] ShowLoader';
}

export class HideLoader {
  static readonly type = '[App] HideLoader';
}

export class ShowSuccessMessage {
  static readonly type = '[App] ShowSuccessMessage';

  constructor(public message: string) { }
}

export class ShowWarningMessage {
  static readonly type = '[App] ShowWarningMessage';

  constructor(public message: string) { }
}

export class ShowErrorMessage {
  static readonly type = '[App] ShowErrorMessage';

  constructor(public error: any) { }
}


export class GetLoggedInUser {
  static readonly type = '[App] GetLoggedInUser';

  constructor(public user: Users) { }
}

export class LogOut {
  static readonly type = '[App] LogOut';
}

export class GetCurrentUser {
  static readonly type = '[App] GetCurrentUser';

  constructor(public user: Users) { }
}
