import type { Reducer, ReducersMapObject } from "redux";

export declare function chainReducers(initialState: any, reducers: Reducer[]): Reducer;

export declare function withDefaultReducers(combineReducers: (reducers: ReducersMapObject) => Reducer): Reducer;
