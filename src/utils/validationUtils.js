class ValidationUtils {
  static checkIfParamterIsNullOrUndefined(value) {
    let isValid = true;
    if (!value) {
      return new BaseError(
        "Client",
        BaseError.CODE_UNDEFINED_PARAMETER,
        "User address is not defined."
      );
    }
    return isValid;
  }
}

export default ValidationUtils;
