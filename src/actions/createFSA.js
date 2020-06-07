import isRequired from '@fuelrats/argument-validator-utils/isRequired'

const mergeMeta = (...meta) => {
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

const createFSA = (type = isRequired('type'), payload, error = false, ...meta) => {
  return {
    type,
    payload,
    error: Boolean(error),
    meta: mergeMeta(
      (error && typeof error !== 'boolean' ? { error } : null),
      ...meta,
    ),
  }
}





export default createFSA
