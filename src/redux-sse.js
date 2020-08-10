import validate from '@fuelrats/validation-util'
import UUID from 'pure-uuid'

import { createFSA } from './actions'

const UUID_VERSION_5 = 5
const CONNECT_RETRY_TIMEOUT = 10000
const SSE_PREFIX = 'sse'
const SSE_CLOSE = 'close'
const SSE_OPEN = 'open'
const SSE_MESSAGE = 'message'
const SSE_ERROR = 'error'

const EventSourceReadyState = Object.freeze({
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
})

const validateConnect = (args) => {
  const validator = validate(args).forFunc('connect')

  validator.assert('url').toExist().toBeOfType('string')
  validator.assert('dispatch').toExist().toBeOfType('function')
}

const validateReduxEventSource = (args) => {
  const validator = validate(args).forClass('ReduxEventSource')

  validator.assert('url').toBeOfType('string')
  validator.assert('events').toBeOfType('array')
  validator.assert('options').toBeOfType('object')
}


class ReduxEventSource {
  #url = null
  #dispatch = null
  #source = null
  #events = null
  #reconnectTimeout = null
  #options = {}

  constructor (url, events = [], options = {}) {
    validateReduxEventSource({ url, events, options })

    this.#url = url
    this.#events = events
    this.#options = options
  }

  connect = (dispatch, paramString) => {
    // Keep dispatch synced
    this.#dispatch = dispatch ?? this.#dispatch

    if (typeof window === 'undefined' || this.#source?.readyState === EventSourceReadyState.OPEN) {
      return
    }

    validateConnect({ url: this.#url, dispatch: this.#dispatch })

    const { withCredentials, transformMessage } = this.#options
    this.#source = new EventSource(this.#url + (paramString ? `?${paramString}` : ''), { withCredentials })

    this.#source.onopen = (event) => {
      this.#dispatch(createFSA(this.getType(SSE_OPEN), event, false))
    }
    this.#source.onerror = (event) => {
      this.#reconnectTimeout = window.setTimeout(this.connect, CONNECT_RETRY_TIMEOUT)
      this.#dispatch(createFSA(this.getType(SSE_ERROR), event, false))
    }

    const onmessage = (event) => {
      const type = this.getType(SSE_MESSAGE, event.type)

      let action = createFSA(type, event.data, false)
      if (transformMessage) {
        action = transformMessage(action, event) ?? action
      }

      this.#dispatch({
        ...action,
        type,
      })
    }

    this.#source.onmessage = onmessage
    this.#events.forEach((eventName) => {
      this.#source.addEventListener(eventName, onmessage)
    })
  }

  close = () => {
    if (typeof window === 'undefined' || this.#source?.readyState !== EventSourceReadyState.OPEN) {
      return
    }

    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout)
      this.#reconnectTimeout = null
    }

    this.#source.close()
    this.#source = null
    this.#dispatch(createFSA(this.getType(SSE_CLOSE), {}, false))
  }

  createReducer = (reducers = {}, initialState = {}) => {
    return (state = initialState, action) => {
      // Separate identifier and action type
      const [instanceId, actionType, eventType] = action.type.split('/')

      // If this isn't the correct instance ID, return
      if (instanceId !== this.instanceId) {
        return state
      }

      // if reducers is a function, call it and return the result
      if (typeof reducers === 'function') {
        return reducers(state, action) ?? state
      }

      // If reducers is not a function, it must be an object of functions. define a function which can call the reducer at a given key.
      const callReducer = (key) => {
        return reducers[key](state, action)
      }

      if (actionType === SSE_MESSAGE) {
        if (eventType) {
          // if this is a message event and the event string is defined, pass it to either an exact match or a namespace wildcard matcher
          if (reducers[eventType]) {
            return callReducer(eventType)
          }

          const { namespaceSeparator } = this.#options

          if (namespaceSeparator) {
            const reducerNamespace = `${eventType.split(namespaceSeparator)[0]}${namespaceSeparator}*`
            if (reducers[reducerNamespace]) {
              return callReducer(reducerNamespace)
            }
          }
        } else if (reducers.message) {
          // If this is a message event but no event string is defined, try to send it to the 'message' listener
          return callReducer('message')
        }
      }

      if (Reflect.has(reducers, actionType)) {
        return callReducer(actionType)
      }

      return state
    }
  }

  getType = (...types) => {
    return `${this.instanceId}/${types.join('/')}`
  }

  get instanceId () {
    const uuid = (new UUID(UUID_VERSION_5, 'ns:URL', this.#url)).format()


    return `${SSE_PREFIX}_${uuid.split('-')[0]}`
  }
}



export default ReduxEventSource
export {
  EventSourceReadyState,
  SSE_CLOSE,
  SSE_ERROR,
  SSE_MESSAGE,
  SSE_OPEN,
}
