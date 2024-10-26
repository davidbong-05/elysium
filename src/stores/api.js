import { acceptHMRUpdate, defineStore } from "pinia";
import ApiClient from "@/services/apiClient";
import ApiTransaction from "@/models/transactions/apiTransaction";
import BaseError from "@/models/errors/baseError";
import ApiError from "@/models/errors/apiError";

const SERVER_API_KEY = import.meta.env.VITE_ELYSIUM_API_KEY;
const SERVER_API_SECRET = import.meta.env.VITE_ELYSIUM_API_SECRET;
const HASH = window.btoa(`${SERVER_API_KEY}:${SERVER_API_SECRET}`);

export const useApiStore = defineStore("api", () => {
  const apiClient = new ApiClient(null, { Authorization: `Basic ${HASH}` });

  const postLogin = async (address) => {
    try {
      const res = await apiClient.post("/api/auth/login", {
        user_address: address,
      });
      const txn = ApiTransaction.parse(res);
      return txn.getTransactionDetails();
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };

  const postLogout = async (userAddress, sessionId) => {
    try {
      const res = await apiClient.post("/api/auth/logout", {
        user_address: userAddress,
        session_id: sessionId,
      });
      const txn = ApiTransaction.parse(res);
      return txn.getTransactionDetails();
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };

  const postPing = async (userAddress, sessionId) => {
    try {
      const res = await apiClient.post("/api/auth/ping", {
        user_address: userAddress,
        session_id: sessionId,
      });
      const txn = ApiTransaction.parse(res);
      return txn.getTransactionDetails();
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };

  const getLinkedCollections = async (userAddress) => {
    let linkedCollections = [];
    try {
      const res = await apiClient.get("/api/collection/" + userAddress);
      const txn = ApiTransaction.parse(res);
      if (txn.isSuccess) {
        linkedCollections = txn.data;
      }
    } catch (error) {
      if (error.response) {
        ApiError.parse(error.response);
      } else {
        BaseError.parse(error);
      }
    } finally {
      return linkedCollections;
    }
  };

  const getUsername = async (userAddress) => {
    if (!userAddress) {
      return new BaseError(
        "Client",
        BaseError.CODE_UNDEFINED_PARAMETER,
        "User address is not defined."
      );
    }
    try {
      const res = await apiClient.get("/api/user/name/" + userAddress);
      const txn = ApiTransaction.parse(res);
      return txn.getTransactionDetails();
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };

  const get = async (url) => {
    return await apiClient.get(url);
  };

  const post = async (url, data) => {
    return await apiClient.post(url, data);
  };

  const put = async (url, data) => {
    return await apiClient.put(url, data);
  };

  return {
    postLogin,
    postLogout,
    postPing,
    getLinkedCollections,
    getUsername,
    get,
    post,
    put,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useApiStore, import.meta.hot));
