import { HttpStatus } from '../http'
import createFSA from './createFSA'





const createAxiosFSA = (type, response, ...meta) => {
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

  return createFSA(
    type,
    data,
    HttpStatus.isError(status), // action is error if status code is error code.
    {
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
    ...meta,
  )
}




export default createAxiosFSA
