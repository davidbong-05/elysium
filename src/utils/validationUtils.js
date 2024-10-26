import BaseError from "@/models/errors/baseError";

class ValidationUtils {
  static checkIfParameterIsNullOrUndefined(parameterName = "Parameter", value) {
    const isValid = value !== null && value !== undefined;
    if (!isValid) {
      new BaseError(
        "Client",
        BaseError.CODE_UNDEFINED_PARAMETER,
        `${parameterName} is not defined.`
      );
    }
    return isValid;
  }
}

export default ValidationUtils;
