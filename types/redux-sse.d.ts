import { Reducer, AnyAction, Action, Dispatch } from 'redux'

import { FSAction } from './flux-standard-action'

export interface ReduxEventSourceInit extends EventSourceInit {
  namespaceSeparator?: string
  headers?: { [header: string]: string };
  transformMessage (action: FSAction, event: MessageEvent): FSAction
}

export interface ReducerDict<S = any, A extends Action<any> = AnyAction> {
  [type:string]: Reducer<S, A>;
}

export type EventSourceReadyState = {
  CONNECTING: number;
  OPEN: number;
  CLOSED: number;
}

export declare const SSE_CLOSE: string;
export declare const SSE_ERROR: string;
export declare const SSE_MESSAGE: string;
export declare const SSE_OPEN: string;

export default class ReduxEventSource {
  constructor(url?:string, events?: Array<string>, options?: ReduxEventSourceInit);

  private url?: string;
  private dispatch?: Dispatch;
  private source?: EventSource;
  private events?: Array<string>;
  private reconnectTimeout?: number
  private options: ReduxEventSourceInit;

  connect: (dispatch: Dispatch, paramString?: string) => void;
  close: () =>  void;

  createReducer: <S = any, A extends Action<any> = AnyAction>(reducers: ReducerDict<S, A>, initialState: S) => Reducer<S, A>

  getEventDispatcher: (type:string) => (payload?:object) => Dispatch<FSAction>;
  getType: (type:string) => string;
  get instanceId (): string;
}
