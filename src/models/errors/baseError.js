class BaseError {
  constructor(source, code, message) {
    this.isSuccess = false;
    this.source = source;
    this.code = code;
    this.message = message;
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
    console.log(`⚠️ Source:   ${this.source}.`);
    console.log(`⚠️ Code:     ${this.code}.`);
    console.log(`⚠️ Message:  ${this.message}`);
  }

  static CODE_UNDEFINED_PARAMETER = "UNDEFINED_PARAMETER";
}

export default BaseError;
