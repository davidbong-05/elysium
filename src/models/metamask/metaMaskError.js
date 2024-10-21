class MetaMaskError {
  static CODE_CHAIN_NOT_ADDED_IN_WALLET = 4902;
  static CODE_USER_REJECTED = 4001;
  static CODE_ACTION_REJECTED = "ACTION_REJECTED";

  constructor({ code, message }) {
    this.isSucess = false;
    this.code = code;
    this.message = message;
    this.isUserRejected = this.checkIfUserRejected();
    this.displayInfo();
  }

  static parse(jsonData) {
    try {
      const data =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      return new MetaMaskError({
        code: data.code || "undefined_code",
        message: data.message || null,
      });
    } catch (error) {
      console.error("Failed to parse data:", error);
      return null;
    }
  }

  displayInfo() {
    console.log(`⚠️ Code: ${this.code}.`);
    console.log(`⚠️ Message: ${this.message}`);
  }

  isChainNotAddedError() {
    return this.code === MetaMaskError.CODE_CHAIN_NOT_ADDED_IN_WALLET;
  }

  checkIfUserRejected() {
    return (
      this.code === MetaMaskError.CODE_USER_REJECTED ||
      this.code === MetaMaskError.CODE_ACTION_REJECTED
    );
  }
}

export default MetaMaskError;
