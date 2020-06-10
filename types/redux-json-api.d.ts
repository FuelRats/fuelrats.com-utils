import { Reducer } from 'redux';

import { JSONAPIResource, JSONAPIResourceIdentifier } from './json-api';
import { PartialFSAMeta } from './flux-standard-action';

export interface JSONAPISliceConfig {
    target?: string;
    mergeMethod?(target: JSONAPIResource, source: JSONAPIResource): JSONAPIResource;
    reducer?(resource: JSONAPIResource): JSONAPIResource;
}

export interface JSONAPISliceConfigsObject {
    [r: string]: JSONAPISliceConfig;
}

export type JSONAPIRelationshipReference = string | JSONAPIResourceIdentifier | (string | JSONAPIResourceIdentifier)[];

export interface JSONAPIRelationshipReferencesObject {
    [r: string]: JSONAPIRelationshipReference;
}

export interface JSONAPIRelationshipUpdateConfig {
    id: string;
    type: string;
    relationships: JSONAPIRelationshipReferencesObject;
}

export default function createJSONAPIReducer(reducerId: string, config: JSONAPISliceConfigsObject): Reducer;

export declare function updatesResources(reducerId: string): PartialFSAMeta;

export declare function deletesResource(reducerId: string, resource: JSONAPIResourceIdentifier): PartialFSAMeta;

export declare function createsRelationship(...relations: JSONAPIRelationshipUpdateConfig[]): PartialFSAMeta;

export declare function deletesRelationship(...relations: JSONAPIRelationshipUpdateConfig[]): PartialFSAMeta;

export declare function defineRelationship(type?: string, id?: string, relationships?: JSONAPIRelationshipReferencesObject): JSONAPIRelationshipUpdateConfig;
