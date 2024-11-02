class BaseError extends Error {
  constructor(source, code, message) {
    super(message);
    this.isSuccess = false;
    this.source = source;
    this.code = code;
    this.displayInfo();
  }

  static parse(jsonData) {
    try {
      const data =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      return new BaseError(
        data.name || "unknown",
        data.code || null,
        data.message || null
      );
    } catch (error) {
      console.error("Failed to parse data:", error);
      return null;
    }
  }

  displayInfo() {
    console.warn(`Source:   ${this.source}.`);
    console.warn(`Code:     ${this.code}.`);
    console.warn(`Message:  ${this.message}`);
    // console.warn(this); for debugging purpose.
  }
}

export default BaseError;
