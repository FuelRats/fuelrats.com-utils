import isRequired from '@fuelrats/argument-validator-utils/isRequired'
import createAxiosFSA from './createAxiosFSA'





const axiosRequest = (service, ...persistMeta) => {
  return (type = isRequired('type'), config, ...meta) => {
    return async (dispatch) => {
      const response = await service.request(config)
      return dispatch(createAxiosFSA(type, response, ...persistMeta, ...meta))
    }
  }
}



export default axiosRequest
