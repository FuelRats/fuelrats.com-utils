import { Middleware } from "redux"

export declare type FSAComplianceMiddleware = Middleware;

export declare function errorLoggerMiddleware(ignoredTypes?: Array<any>): Middleware;
