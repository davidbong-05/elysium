import BaseError from "./baseError";

class MetaMaskError extends BaseError {
  static CODE_CHAIN_NOT_ADDED_IN_WALLET = 4902;
  static CODE_USER_REJECTED = 4001;
  static CODE_ACTION_REJECTED = "ACTION_REJECTED";

  constructor({ code, message }) {
    super("MetaMask", code, message);
    this.isUserRejected = this.isRejectedByUser();
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

  isChainNotAddedError() {
    return this.code === MetaMaskError.CODE_CHAIN_NOT_ADDED_IN_WALLET;
  }

  isRejectedByUser() {
    return (
      this.code === MetaMaskError.CODE_USER_REJECTED ||
      this.code === MetaMaskError.CODE_ACTION_REJECTED
    );
  }
}

export default MetaMaskError;
