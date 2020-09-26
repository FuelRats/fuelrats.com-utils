import isRequired from '@fuelrats/validation-util/require'
import { produce } from 'immer'


export function deepMergeResource (target, source) {
  // Do not merge if there is a ID or Type mismatch
  if (target.id !== source.id || target.type !== source.type) {
    return target
  }

  // Merge attributes
  if (source.attributes) {
    target.attributes = {
      ...(target.attributes ?? {}),
      ...(source.attributes ?? {}),
    }
  }

  // Merge meta
  if (source.meta) {
    target.meta = {
      ...(target.meta ?? {}),
      ...(source.meta ?? {}),
    }
  }

  // Iterate over source relationships. If the given relationship has data, merge it. Otherwise, leave it alone.
  if (source.relationships) {
    if (target.relationships) {
      Object.keys(source.relationships).forEach((key) => {
        if (Reflect.has(source.relationships[key], 'data')) {
          target.relationships[key] = source.relationships[key]
        }
      })
    } else {
      target.relationships = { ...source.relationships }
    }
  }

  return target
}




export default function createJSONAPIReducer (reducerId, config) {
  const JSONAPI_SCOPE = `__jsonapi/${reducerId}`
  const CREATES_RELATIONSHIP = `${JSONAPI_SCOPE}/create/relationship`
  const DELETES_RELATIONSHIP = `${JSONAPI_SCOPE}/delete/relationship`
  const DELETES_RESOURCE = `${JSONAPI_SCOPE}/delete/resource`
  const RESOURCE = `${JSONAPI_SCOPE}/resource-linkage`

  const resolveResourceConfig = (resource) => {
    if (!resource || !config[resource.type]) {
      return undefined
    }

    return {
      target: resource.type,
      mergeMethod: (_, target, source) => {
        return deepMergeResource(target, source)
      },
      ...config[resource.type],
    }
  }
  const insertResource = (draftState, resourceConfig, resource) => {
    if (!resourceConfig || !resource) {
      return
    }

    const {
      target: type,
      mergeMethod,
      reducer,
    } = resourceConfig
    const { id } = resource

    const finalResource = reducer ? reducer(resource) : resource

    if (draftState[type][id]) {
      draftState[type][id] = mergeMethod(
        draftState,
        draftState[type][id],
        finalResource,
      )
    } else {
      draftState[type][id] = finalResource
    }
  }

  const insertResourceList = (draftState, resources = []) => {
    const resourceConfig = resolveResourceConfig(resources[0])
    if (!resourceConfig) {
      return
    }
    resources.forEach((resource) => {
      insertResource(draftState, resourceConfig, resource)
    })
  }

  const insertIncludedResources = (draftState, resources = []) => {
    resources.forEach((resource) => {
      insertResource(
        draftState,
        resolveResourceConfig(resource),
        resource,
      )
    })
  }

  const deleteResource = (draftState, { type, id }) => {
    if (!config[type]) {
      // prevent overreach into uncontrolled state members
      return
    }
    delete draftState[type][id]
  }

  const mapModifiedRelationshipData = (draftState, resources, callback) => {
    resources.forEach((resource) => {
      if (!resource) {
        return
      }

      const {
        type,
        id,
        relationships,
      } = resource

      if (!config[type] || !draftState[type] || !draftState[type][id]) {
        return
      }

      Object.entries(relationships).forEach(([relationshipKey, relationshipData]) => {
        const targetResourceRelationship = draftState[type][id].relationships[relationshipKey]

        if (!targetResourceRelationship) {
          throw new Error(`Attempted to update a relationship that does not exist for resource type ${type}`)
        }

        if (Array.isArray(targetResourceRelationship.data)) {
          if (!Array.isArray(relationshipData)) {
            throw new TypeError('Relationship update data for to-many relationships MUST be an array.')
          }
        } else if (Array.isArray(relationshipData)) {
          throw new TypeError('Relationship update data for to-one relationships MUST NOT be an array.')
        }

        draftState[type][id].relationships[relationshipKey].data = callback(targetResourceRelationship.data, relationshipData)
      })
    })
  }

  const reduce = produce((draftState, action) => {
    // Don't reduce action if the action doesn't request it, or there's an error.
    if (action.meta?.[JSONAPI_SCOPE] !== reducerId || action.error) {
      return
    }

    // reduce any included resources
    if (action.payload?.included) {
      insertIncludedResources(draftState, action.payload.included)
    }

    // reduce any resources in data
    const payloadData = action.payload?.data
    if (payloadData) {
      if (Array.isArray(payloadData)) {
        insertResourceList(draftState, payloadData)
      } else {
        insertResource(draftState, resolveResourceConfig(payloadData), payloadData)
      }
    }

    // If a resource was deleted, delete it.
    const deletedResource = action.meta[DELETES_RESOURCE]
    if (deletedResource) {
      deleteResource(draftState, deletedResource)
    }

    // generate new relationship links
    const newRelationships = action.meta[CREATES_RELATIONSHIP]
    if (newRelationships) {
      mapModifiedRelationshipData(draftState, newRelationships, (targetData, newData) => {
        if (Array.isArray(targetData)) {
          return [
            ...targetData,
            ...newData.map((newLink) => {
              return newLink === RESOURCE
                ? { type: action.payload.data.type, id: action.payload.data.id }
                : newLink
            }),
          ]
        }
        return newData === RESOURCE
          ? { type: action.payload.data.type, id: action.payload.data.id }
          : newData
      })
    }

    // remove old relationship links
    const deletedRelationships = action.meta[DELETES_RELATIONSHIP]
    if (deletedRelationships) {
      mapModifiedRelationshipData(draftState, deletedRelationships, (targetData, deletedData) => {
        if (Array.isArray(targetData)) {
          return targetData.reduce((acc, existingLink) => {
            if (deletedData.find((deletedLink) => {
              return deletedLink.type === existingLink.type && deletedLink.id === existingLink.id
            })) {
              return acc
            }

            acc.push(existingLink)
            return acc
          }, [])
        }
        return null
      })
    }
  })

  function updatesResources () {
    return {
      [JSONAPI_SCOPE]: reducerId,
    }
  }

  function deletesResource ({ type, id }) {
    return {
      [DELETES_RESOURCE]: { type, id },
    }
  }

  function createsRelationship (...relations) {
    return {
      [CREATES_RELATIONSHIP]: relations,
    }
  }

  function deletesRelationship (...relations) {
    return {
      [DELETES_RELATIONSHIP]: relations,
    }
  }



  return {
    RESOURCE,
    reduce,
    updatesResources,
    deletesResource,
    createsRelationship,
    deletesRelationship,
  }
}





export function defineRelationship (
  relatedResource,
  relationships = isRequired('relationships'),
) {
  return relatedResource
    ? { type: relatedResource.type, id: relatedResource.id, relationships }
    : null
}
