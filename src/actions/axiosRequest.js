import isRequired from '@fuelrats/argument-validator-utils/isRequired'
import createAxiosFSA from './createAxiosFSA'





const axiosRequest = (service) => {
  return (type = isRequired('type'), config, ...meta) => {
    return async (dispatch) => {
      const response = await service.request(config)
      return dispatch(createAxiosFSA(type, response, ...meta))
    }
  }
}



export default axiosRequest
