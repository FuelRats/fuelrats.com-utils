import isRequired from '@fuelrats/argument-validator-utils/isRequired'
import { produce } from 'immer'





const CREATES_RESOURCE = '__jsonapi/create/resource'
const CREATES_RELATIONSHIP = '__jsonapi/create/relationship'
const DELETES_RESOURCE = '__jsonapi/delete/resource'
const DELETES_RELATIONSHIP = '__jsonapi/delete/relationship'
const LISTS_RESOURCES = '__jsonapi/list/resource'
const READS_RESOURCE = '__jsonapi/read/resource'
const UPDATES_RESOURCE = '__jsonapi/update/resource'
const JSONAPI_MODE = '__jsonapi/mode'
const RESOURCE = '__jsonapi/resource-linkage'





const createJSONAPIReducer = (config) => {
  const resolveResourceConfig = (resource) => {
    if (!resource || !config[resource.type]) {
      return undefined
    }

    return {
      target: resource.type,
      mergeMethod: Object.assign,
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

    draftState[type][id] = mergeMethod(
      draftState[type][id] ?? {},
      reducer ? reducer(resource) : resource,
    )
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

  const insertIncludedResources = (draftState, resources) => {
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





  const iterateResourceRelationships = (draftState, resources, callback) => {
    resources.forEach((resource) => {
      const {
        type,
        id,
        relationships,
      } = resource

      if (!config[type] || !draftState[type] || !draftState[type][id]) {
        return
      }

      Object.entries(relationships).forEach(([relationshipKey, relationshipData]) => {
        const resRelationship = draftState[type][id].relationships[relationshipKey]

        if (!resRelationship) {
          throw new Error(`Attempted to update a relationship that does not exist for resource type ${type}`)
        }

        if (Array.isArray(resRelationship.data)) {
          if (!Array.isArray(relationshipData.data)) {
            throw new TypeError('Relationship update data for to-many relationships MUST be an array.')
          }
        } else if (Array.isArray(relationshipData.data)) {
          throw new TypeError('Relationship update data for to-one relationships MUST NOT be an array.')
        }

        callback(resource, relationshipKey, relationshipData)
      })
    })
  }

  const reduceRelationships = (draftState, action) => {
    const newRelationships = action.meta[CREATES_RELATIONSHIP]
    if (newRelationships) {
      iterateResourceRelationships(draftState, newRelationships, (targetData, relKey, relData) => {
        const { type, id } = targetData
        const { data: newData } = relData

        if (Array.isArray(newData)) {
          newData.forEach((newLink) => {
            draftState[type][id].relationships[relKey].data.push(
              newLink === RESOURCE
                ? { type: action.payload.data.type, id: action.payload.data.id }
                : newLink,
            )
          })
        } else {
          draftState[type][id].relationships[relKey].data = newData === RESOURCE
            ? { type: action.payload.data.type, id: action.payload.data.id }
            : newData
        }
      })
    }

    const deletedRelationships = action.meta[DELETES_RELATIONSHIP]
    if (deletedRelationships) {
      iterateResourceRelationships(draftState, deletedRelationships, (targetData, relKey, relData) => {
        const { type, id } = targetData
        const { data: deletedData } = relData

        if (Array.isArray(deletedData)) {
          draftState[type][id].relationships[relKey].data = relData.data.reduce((acc, link) => {
            if (deletedData.find((deletedLink) => {
              return deletedLink.type === link.type && deletedLink.id === link.id
            })) {
              return acc
            }

            acc.push(link)
            return acc
          }, [])
        } else {
          draftState[type][id].relationships[relKey].data = null
        }
      })
    }
  }





  return produce((draftState, action) => {
    // Don't reduce action if the action doesn't request it, or there's an error.
    if (!action.meta?.[JSONAPI_MODE] || action.error) {
      return
    }

    // reduce any included resources
    if (action.payload.included) {
      insertIncludedResources(draftState, action.payload.included)
    }

    // Find out how we're interpreting data from the API, and reduce accordingly
    switch (action.meta[JSONAPI_MODE]) {
      case CREATES_RESOURCE:
      case UPDATES_RESOURCE:
      case READS_RESOURCE:
        insertResource(draftState, action.payload.data)
        break

      case LISTS_RESOURCES:
        insertResourceList(draftState, action.payload.data)
        break

      case DELETES_RESOURCE:
        deleteResource(draftState, action.meta[DELETES_RESOURCE])
        break

      default:
        break
    }

    reduceRelationships(draftState, action)
  })
}





const createsResource = () => {
  return {
    [JSONAPI_MODE]: CREATES_RESOURCE,
  }
}

const deletesResource = (type, id) => {
  return {
    [JSONAPI_MODE]: DELETES_RESOURCE,
    [DELETES_RESOURCE]: { type, id },
  }
}

const listsResources = () => {
  return {
    [JSONAPI_MODE]: LISTS_RESOURCES,
  }
}

const readsResource = () => {
  return {
    [JSONAPI_MODE]: READS_RESOURCE,
  }
}

const updatesResource = () => {
  return {
    [JSONAPI_MODE]: UPDATES_RESOURCE,
  }
}

const createsRelationship = (...relations) => {
  return {
    [CREATES_RELATIONSHIP]: relations,
  }
}

const deletesRelationship = (...relations) => {
  return {
    [DELETES_RELATIONSHIP]: relations,
  }
}

const defineRelationship = (type = isRequired('type'), id = isRequired('id'), relationships = isRequired('relationships')) => {
  return { type, id, relationships }
}

export {
  createJSONAPIReducer,
  createsResource,
  defineRelationship,
  readsResource,
  listsResources,
  deletesResource,
  updatesResource,
  createsRelationship,
  deletesRelationship,
  RESOURCE,
}
