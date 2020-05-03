import { Selector, State, Action, StateContext } from '@ngxs/store';
import { GetChatObject, GetChatMessages } from './chat.action';
import { TripsStateModel } from '../trip/trips.state';

export class ChatStateModel {
  chat: any[];
  chatObject: any;

}

@State<ChatStateModel>({
  name: 'chat',
  defaults: {
    chat: [],
    chatObject: null
  }
})

export class ChatState {


  @Selector()
  static getChatObject(state: ChatStateModel) {
    return state.chatObject;
  }

  @Selector()
  static getChat(state: ChatStateModel) {
    return state.chat;
  }

  constructor() { }

  @Action(GetChatObject)
  getChatObject(ctx: StateContext<ChatStateModel>, { chatObject }: GetChatObject) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      chatObject
    });
  }

  @Action(GetChatMessages)
  getChatMessages(ctx: StateContext<ChatStateModel>, { chat }: GetChatMessages) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      chat
    });
  }
}

