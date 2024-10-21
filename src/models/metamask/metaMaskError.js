class MetaMaskError {
  static code_chain_not_added_in_wallet = 4902;
  static code_user_rejected = 4001;
  static code_action_rejected = "ACTION_REJECTED";

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
    return this.code === MetaMaskError.code_chain_not_added_in_wallet;
  }

  checkIfUserRejected() {
    return (
      this.code === MetaMaskError.code_user_rejected ||
      this.code === MetaMaskError.code_action_rejected
    );
  }
}

export default MetaMaskError;
