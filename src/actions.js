import isRequired from '@fuelrats/argument-validator-utils/isRequired'

import { HttpStatus } from './http'





const mergeMeta = (meta) => {
  return meta.reduce((acc, metaData) => {
    if (metaData && typeof metaData === 'object') {
      return {
        ...acc,
        ...metaData,
      }
    }
    return acc
  }, {})
}





export function createFSA (type = isRequired('type'), payload, error = false, ...meta) {
  return {
    type,
    payload: error && typeof error === 'object' ? error : payload,
    error: Boolean(error),
    meta: mergeMeta(meta),
  }
}

export function createAxiosFSA (type, response, ...meta) {
  const {
    config,
    data,
    headers,
    request,
    status,
    statusText,
  } = response

  let requestBody = config.data

  if (config.headers['Content-Type'] === 'application/json') {
    requestBody = JSON.parse(requestBody)
  }

  return {
    type,
    payload: data,
    error: HttpStatus.isError(status), // action is error if status code is error code.
    meta: {
      ...mergeMeta(meta),
      request: {
        url: config.url,
        baseUrl: config.baseURL,
        method: config.method,
        data: requestBody,
      },
      response: {
        data: request.response,
        headers,
        status,
        statusText,
      },
    },
  }
}

export function axiosRequest (service, ...commmonMeta) {
  return (type = isRequired('type'), config, ...meta) => {
    return async (dispatch) => {
      const response = await service.request(config)

      return dispatch(
        createAxiosFSA(
          type,
          response,
          ...commmonMeta,
          ...meta,
        ),
      )
    }
  }
}
