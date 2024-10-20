class MetaMaskReponse {
  static code_chain_not_added_in_wallet = 4902;
  static code_user_rejected = 4001;

  constructor({ code, message }) {
    this.code = code;
    this.message = message;
    this.displayInfo();
  }

  static parse(jsonData) {
    try {
      const data =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      return new MetaMaskReponse({
        code: data.code,
        message: data.message,
      });
    } catch (error) {
      console.error("Failed to parse User data:", error);
      return null;
    }
  }

  displayInfo() {
    console.log(`⚠️ Code: ${this.code}.`);
    console.log(`⚠️ Message: ${this.message}`);
  }

  isChainNotAddedError() {
    return this.code === MetaMaskReponse.code_chain_not_added_in_wallet;
  }
}

export default MetaMaskReponse;
