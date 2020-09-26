/* Links */

export type JSONAPILink = string | { href: string, meta: object }
export interface JSONAPILinksObject {
  [l: string]: JSONAPILink
}





/* Resource Identifier */

export interface JSONAPIResourceIdentifier<
  T extends string = string
> {
  id: string
  type: T
  meta?: object
}

export type JSONAPIResourceIdentifierOf<R> = JSONAPIResourceIdentifier<R extends JSONAPIResource<infer T> ? T : never>



/* Relationships */

export interface JSONAPIRelationship<T extends string = string> {
  links?: JSONAPILinksObject
  meta?: object
  data?: null | JSONAPIResourceIdentifier<T> | JSONAPIResourceIdentifier<T>[]
}

export interface JSONAPIRelationshipToOne<T extends string = string> extends JSONAPIRelationship {
  data: null | JSONAPIResourceIdentifier<T>
}

export interface JSONAPIRelationshipToMany<T extends string = string> extends JSONAPIRelationship {
  data: JSONAPIResourceIdentifier<T>[]
}

export interface JSONAPIRelationshipsObject {
  [r: string]: JSONAPIRelationship
}





/* Resource */

export interface JSONAPIResource<
  T extends string = string,
  A extends object = (object | undefined),
  R extends JSONAPIRelationshipsObject = (JSONAPIRelationshipsObject | undefined)
> extends JSONAPIResourceIdentifier<T> {
  attributes: A
  relationships: R
}





/* Resource Partials */

export interface JSONAPIPartialResource<
  T extends string = string,
  A extends object = object,
  R extends JSONAPIRelationshipsObject = JSONAPIRelationshipsObject
> extends Omit<JSONAPIResourceIdentifier<T>, 'id'> {
  id?: string
  attributes?: Partial<A>
  relationships?: Partial<R>
}



export type JSONAPIPartialResourceOf<O> = JSONAPIPartialResource<
  O extends JSONAPIResource<infer T, any, any> ? T : string,
  O extends JSONAPIResource<any, infer A, any> ? A : object,
  O extends JSONAPIResource<any, any, infer R> ? R : JSONAPIRelationshipsObject
>

export interface JSONAPIRequestDocument {
  data: JSONAPIPartialResource
}





/* Errror Object */

export interface JSONAPIError {
  id?: string
  links?: {
    about: JSONAPILink
  }
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: {
    pointer?: string
    parameter?: string
  }
  meta?: object
}





/* Document */

interface JSONAPIBaseDocument {
  jsonapi?: object
  links?: JSONAPILinksObject
}

export interface JSONAPIDataDocument<
  T extends string = string,
  A extends object = object,
  R extends JSONAPIRelationshipsObject = JSONAPIRelationshipsObject
> extends JSONAPIBaseDocument {
  data: JSONAPIResource<T, A, R> | JSONAPIResource<T, A, R>[]
  errors?: undefined
  meta?: object
  included?: JSONAPIResource[]
}

export interface JSONAPIErrorDocument extends JSONAPIBaseDocument {
  data?: undefined
  errors: JSONAPIError[]
  meta?: object
}

export interface JSONAPIMetaDocument extends JSONAPIBaseDocument {
  data?: undefined
  errors?: undefined
  meta: object
}

export type JSONAPIDocument<
  T extends string = string,
  A extends object = object,
  R extends JSONAPIRelationshipsObject = JSONAPIRelationshipsObject
> = JSONAPIDataDocument<T, A, R> | JSONAPIErrorDocument | JSONAPIMetaDocument
