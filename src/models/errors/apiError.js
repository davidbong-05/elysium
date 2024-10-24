import BaseError from "./baseError";

class ApiError extends BaseError {
  constructor({ source, code, message }) {
    super(source, code, message);
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
}

export default ApiError;
