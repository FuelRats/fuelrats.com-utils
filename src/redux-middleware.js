import { isFSA, isError } from 'flux-standard-action'





export const FSAComplianceMiddleware = () => {
  return (next) => {
    return (action) => {
      const finalAction = next(action)

      if (!isFSA(finalAction)) {
        console.error('WARNING! non-compliant action object was dispatched.', finalAction)
        throw new Error('STOP IT! Get some help. (An action was non-compliant. check console.)')
      }

      return finalAction
    }
  }
}





export const errorLoggerMiddleware = (ignoredTypes = []) => {
  return () => {
    return (next) => {
      return (action) => {
        const finalAction = next(action)

        if (isError(finalAction) && !ignoredTypes.includes(finalAction.type)) {
          console.error('GIVE THIS TO YOUR TECHRAT:', finalAction)
        }

        return finalAction
      }
    }
  }
}
