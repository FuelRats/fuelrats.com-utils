import { Action } from "redux"

export interface FSAMeta {
  [m: string]: any
}
export type PartialFSAMeta = Partial<FSAMeta>

export interface FSAction extends Action {
  type: string,
  payload?: any
  error?: any
  meta?: FSAMeta
}
