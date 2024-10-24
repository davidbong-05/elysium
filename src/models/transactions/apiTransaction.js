import BaseTransaction from "./baseTransaction";

class ApiTransaction extends BaseTransaction {
  constructor({ status, statusText, data }) {
    super(status === ApiTransaction.CODE_OK);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }

  static parse(jsonData) {
    try {
      const data =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      return new ApiTransaction({
        status: data.status || null,
        statusText: data.statusText || null,
        data: data.data || null,
      });
    } catch (error) {
      console.error("Failed to parse data:", error);
      return null;
    }
  }

  getTransactionDetails() {
    return {
      isSuccess: this.isSuccess,
      status: this.status,
      statusText: this.statusText,
      data: this.data,
    };
  }

  static CODE_OK = 200;
  static CODE_UNAUTHORIZED = 401;
  static CODE_BAD_REQUEST = 400;
}

export default ApiTransaction;
