import BaseError from "./baseError";

class ApiError extends BaseError {
  constructor({ source, code, message }) {
    super(source, code, message);
    this.isNotFound = code === ApiError.CODE_NOT_FOUND;
    this.isApiServerError = code === ApiError.CODE_INTERNAL_SERVER_ERROR;
  }

  static parse(jsonData) {
    try {
      const data =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      return new ApiError({
        source: data.name || "API",
        code: data.status || null,
        message: data.data || null,
      });
    } catch (error) {
      console.error("Failed to parse data:", error);
      return null;
    }
  }

  static CODE_UNAUTHORIZED = 401;
  static CODE_BAD_REQUEST = 400;
  static CODE_NOT_FOUND = 404;
  static CODE_INTERNAL_SERVER_ERROR = 500;
}

export default ApiError;
