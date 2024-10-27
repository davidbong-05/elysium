import { MetaMaskResponseCode } from "../enums";
import BaseError from "./baseError";

class MetaMaskError extends BaseError {
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
    return this.code === MetaMaskResponseCode.CODE_CHAIN_NOT_ADDED_IN_WALLET;
  }

  isRejectedByUser() {
    return (
      this.code === MetaMaskResponseCode.CODE_USER_REJECTED ||
      this.code === MetaMaskResponseCode.CODE_ACTION_REJECTED
    );
  }
}

export default MetaMaskError;
