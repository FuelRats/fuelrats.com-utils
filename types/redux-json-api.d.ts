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

export default function createJSONAPIReducer(reducerId: string, config: JSONAPISliceConfigsObject): {
  reduce: Reducer;
  RESOURCE: Readonly<string>;
  updatesResources: () => PartialFSAMeta;
  deletesResource: (resource: JSONAPIResourceIdentifier) => PartialFSAMeta;
  createsRelationship: (...relations: (null | JSONAPIRelationshipUpdateConfig)[]) => PartialFSAMeta;
  deletesRelationship: (...relations: (null | JSONAPIRelationshipUpdateConfig)[]) => PartialFSAMeta;
};

export declare function defineRelationship(
  relatedResource: JSONAPIResourceIdentifier,
  relationships?: JSONAPIRelationshipReferencesObject
): (null | JSONAPIRelationshipUpdateConfig);
