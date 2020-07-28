import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ThunkAction } from 'redux-thunk'

import { HttpStatus, HttpMethod, HttpStatusText } from './http';
import { FSAction, PartialFSAMeta, FSAMeta } from './flux-standard-action';
import { JSONAPIDocument } from './json-api';





export interface AxiosFSAMeta extends FSAMeta {
  request: {
    url: string;
    baseUrl: string;
    method: HttpMethod;
    data: any;
  };
  response: {
    data: any;
    headers: {
      [index: string]: string;
    };
    status: HttpStatus;
    statusText: HttpStatusText;
  };
}

export interface AxiosFSA extends FSAction {
    meta: AxiosFSAMeta;
}

export declare function createFSA(type: string, payload: any, error?: any, ...meta: PartialFSAMeta[]): FSAction;

export declare function createAxiosFSA(type: string, response: AxiosResponse<JSONAPIDocument>, ...meta: PartialFSAMeta[]): AxiosFSA;

export declare function axiosRequest(
  service: AxiosInstance,
  ...commonMeta: PartialFSAMeta[]
): (
  type: string,
  config: AxiosRequestConfig,
  ...meta: PartialFSAMeta[]
) => ThunkAction<AxiosFSA, unknown, unknown, AxiosFSA>;
