export function chainReducers (initialState, reducers) {
  return (state = initialState, action) => {
    let nextState = state

    reducers.forEach((reducer) => {
      nextState = reducer(nextState, action)

      if (typeof nextState === 'undefined') {
        throw Error('Reducer returned invalid return value. Reducers must always return original or updated state.')
      }
    })

    return nextState
  }
}


export function withDefaultReducers (combineReducers) {
  return (initialState, sliceReducers) => {
    return combineReducers(Object.entries(initialState).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: sliceReducers[key] ?? ((state = value) => {
          return state
        }),
      }
    }, {}))
  }
}
