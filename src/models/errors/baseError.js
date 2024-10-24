class BaseError {
  constructor(source, code, message) {
    this.isSuccess = false;
    this.source = source;
    this.code = code;
    this.message = message;
  }

  displayInfo() {
    console.log(`⚠️ Source  : ${this.source}.`);
    console.log(`⚠️ Code: ${this.code}.`);
    console.log(`⚠️ Message: ${this.message}`);
  }
}

export default BaseError;
