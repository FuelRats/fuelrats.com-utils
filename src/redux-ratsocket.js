import validate from '@fuelrats/validation-util'
import UUID from 'pure-uuid'

import { createFSA } from './actions'

const UUID_VERSION_5 = 5
const CONNECT_RETRY_TIMEOUT = 10000
const SOCKET_PREFIX = 'ratsock'
const SOCKET_CLOSE = 'close'
const SOCKET_OPEN = 'open'
const SOCKET_MESSAGE = 'message'
const SOCKET_ERROR = 'error'

const WebSocketReadyState = Object.freeze({
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
})

const validateConnect = (args) => {
  const validator = validate(args).forFunc('connect')

  validator.assert('dispatch').toExist().toBeOfType('function')
}

const validateReduxRatSocket = (args) => {
  const validator = validate(args).forClass('ReduxRatSocket')

  validator.assert('url').toExist().toBeOfType('string')
  validator.assert('options').toBeOfType('object')
}


class ReduxRatSocket {
  #url = null
  #dispatch = null
  #socket = null
  #reconnectTimeout = null
  #options = {}

  constructor (url, options = {}) {
    validateReduxRatSocket({ url, options })

    this.#url = url
    this.#options = options
  }

  connect = (paramString) => {
    if (typeof window === 'undefined' || this.#socket?.readyState === WebSocketReadyState.OPEN) {
      return
    }

    if (typeof paramString === 'string' && this.#options.params !== paramString) {
      this.#options.params = paramString
    }

    validateConnect({ dispatch: this.#dispatch })

    const { transformAction, params } = this.#options

    this.#socket = new WebSocket(this.#url + (params ? `?${params}` : ''), ['FR-JSONAPI-WS'])

    this.#socket.onopen = (event) => {
      this.#dispatch(createFSA(this.getType(SOCKET_OPEN), event, false))
    }

    this.#socket.onclose = ({ code, reason, wasClean }) => {
      if (wasClean) {
        this.#socket = null
      } else {
        this.#reconnectTimeout = window.setTimeout(this.connect, CONNECT_RETRY_TIMEOUT)
      }

      this.#dispatch(createFSA(this.getType(SOCKET_CLOSE), { code, reason, wasClean }))
    }

    this.#socket.onmessage = (event) => {
      const [eventType, userId, resourceId, data] = JSON.parse(event.data)

      if (typeof userId === 'number') {
        return // we only understand events right now. Request responses use a http status code in the 2nd position so this is how we detect them.
      }

      const type = this.getType(SOCKET_MESSAGE, eventType)

      let action = createFSA(type, data, false, { userId, resourceId })

      if (transformAction) {
        action = transformAction(action, event)

        if (!action) {
          return
        }
      }

      this.#dispatch({
        ...action,
        type,
      })
    }
  }

  close = () => {
    if (typeof window === 'undefined' || this.#socket?.readyState !== WebSocketReadyState.OPEN) {
      return
    }

    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout)
      this.#reconnectTimeout = null
    }

    this.#socket.close(1000, 'goodbye')
  }

  createMiddleware = () => {
    return (store) => {
      this.#dispatch = store.dispatch

      return (next) => {
        return (action) => {
          return next(action)
        }
      }
    }
  }

  createReducer = (reducers = {}, initialState = {}) => {
    return (state = initialState, action) => {
      // Separate identifier and action type
      const [instanceId, actionType, eventType] = action.type.split('/')

      if (instanceId !== this.instanceId) {
        return state
      }

      if (typeof reducers === 'function') {
        return reducers(state, action) ?? state
      }

      if (actionType === SOCKET_MESSAGE && eventType && reducers[eventType]) {
        return reducers[eventType](state, action)
      }

      if (reducers[actionType]) {
        return reducers[actionType](state, action)
      }

      return state
    }
  }

  getType = (...types) => {
    return `${this.instanceId}/${types.filter((type) => {
      return !['object', 'undefined'].includes(typeof type)
    }).join('/')}`
  }

  get instanceId () {
    const uuid = (new UUID(UUID_VERSION_5, 'ns:URL', this.#url)).format()


    return `${SOCKET_PREFIX}_${uuid.split('-')[0]}`
  }
}



export default ReduxRatSocket
export {
  WebSocketReadyState,
  SOCKET_CLOSE,
  SOCKET_ERROR,
  SOCKET_MESSAGE,
  SOCKET_OPEN,
}
