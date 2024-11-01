import { ErrorCode } from "@/models/enums.js";
import BaseError from "@/models/errors/baseError.js";

class ValidationUtils {
  static checkIfParameterIsNullOrUndefined(parameterName = "Parameter", value) {
    const isValid = value !== null && value !== undefined;
    if (!isValid) {
      new BaseError(
        "Client",
        ErrorCode.CODE_UNDEFINED_PARAMETER,
        `${parameterName} is not defined.`
      );
    }
    return isValid;
  }
}

export default ValidationUtils;
