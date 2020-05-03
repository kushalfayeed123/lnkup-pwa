export class GetChatObject {
  static readonly type: '[Chat] GetChatObject';

  constructor(public chatObject: any) { }
}

export class GetChatMessages {
  static readonly type = '[Chat] GetChatMessages';

  constructor(public chat: any[]) { }
}
