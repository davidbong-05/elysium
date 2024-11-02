import { MetaMaskResponseCode } from "../enums.js";
import BaseError from "./baseError.js";

class MetaMaskError extends BaseError {
  constructor({ code, message }) {
    super("MetaMask", code, message);
    this.isUserRejected = this.isRejectedByUser();
  }

  static parse(jsonData) {
    try {
      let data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      const jsonMatch = String(jsonData).match(/info=({.*}), code/);
      if (jsonMatch && jsonMatch[1]) {
        data = JSON.parse(jsonMatch[1]);
      }

      return new MetaMaskError({
        code: data.error?.code || data.code || "undefined_code",
        message: data.error?.message || data.message || null,
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
