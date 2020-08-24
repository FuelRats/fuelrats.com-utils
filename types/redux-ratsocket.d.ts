import { Reducer, AnyAction, Action, Dispatch, Middleware } from 'redux'

import { FSAction } from './flux-standard-action'

export interface ReduxRatSocketInit {
  transformMessage (action: FSAction, event: MessageEvent): FSAction
}

export interface ReducerDict<S = any, A extends Action<any> = AnyAction> {
  [type:string]: Reducer<S, A>;
}

export type WebSocketReadyState = {
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
}

export declare const SSE_CLOSE: string;
export declare const SSE_ERROR: string;
export declare const SSE_MESSAGE: string;
export declare const SSE_OPEN: string;

export default class ReduxRatSocket {
  constructor(url: string, options?: ReduxRatSocketInit);

  private url?: string;
  private dispatch?: Dispatch;
  private socket?: WebSocket;
  private reconnectTimeout?: number;
  private options: ReduxRatSocketInit;

  connect: (paramString?: string) => void;
  close: () => void;

  createMiddleware: () => Middleware;
  createReducer: <S = any, A extends Action<any> = AnyAction>(reducers: ReducerDict<S, A>, initialState: S) => Reducer<S, A>;
  getType: (...types:string[]) => string;
  get instanceId (): string;
}
