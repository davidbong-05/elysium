import { acceptHMRUpdate, defineStore } from "pinia";
import ApiClient from "@/services/apiClient";
import ApiTransaction from "@/models/transactions/apiTransaction";
import BaseError from "@/models/errors/baseError";
import ApiError from "@/models/errors/apiError";
import User from "@/models/user";

const SERVER_API_KEY = import.meta.env.VITE_ELYSIUM_API_KEY;
const SERVER_API_SECRET = import.meta.env.VITE_ELYSIUM_API_SECRET;
const HASH = window.btoa(`${SERVER_API_KEY}:${SERVER_API_SECRET}`);

export const useApiStore = defineStore("api", () => {
  const apiClient = new ApiClient(null, { Authorization: `Basic ${HASH}` });

  //#region nft collections
  const getAllCollections = async () => {
    let collections = [];
    try {
      const res = await apiClient.get("/api/collection/all");
      const txn = ApiTransaction.parse(res);
      if (txn.isSuccess) {
        collections = txn.data;
      }
    } catch (error) {
      if (error.response) {
        ApiError.parse(error.response);
      } else {
        BaseError.parse(error);
      }
    } finally {
      return collections;
    }
  };

  const getCollections = async () => {
    let collections = [];
    try {
      const res = await apiClient.get("/api/collection/");
      const txn = ApiTransaction.parse(res);
      if (txn.isSuccess) {
        collections = txn.data;
      }
    } catch (error) {
      if (error.response) {
        ApiError.parse(error.response);
      } else {
        BaseError.parse(error);
      }
    } finally {
      return collections;
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

  const getTopCollections = async () => {
    let collections = [];
    try {
      const res = await apiClient.get("/api/collection/topCollection");
      const txn = ApiTransaction.parse(res);
      if (txn.isSuccess) {
        collections = txn.data;
      }
    } catch (error) {
      if (error.response) {
        ApiError.parse(error.response);
      } else {
        BaseError.parse(error);
      }
    } finally {
      return collections;
    }
  };
  //#endregion nft collections

  //#region users
  const getTopUsers = async () => {
    let users = [];
    try {
      const res = await apiClient.get("/api/user/topUser");
      const txn = ApiTransaction.parse(res);
      if (txn.isSuccess) {
        users = await Promise.all(
          txn.data.map(async (i) => {
            return User.parse(i);
          })
        );
      }
    } catch (error) {
      if (error.response) {
        ApiError.parse(error.response);
      } else {
        BaseError.parse(error);
      }
    } finally {
      return users;
    }
  };

  const getUsers = async () => {
    let users = [];
    try {
      const res = await apiClient.get("/api/user/");
      const txn = ApiTransaction.parse(res);
      if (txn.isSuccess) {
        users = await Promise.all(
          txn.data.map(async (i) => {
            return User.parse(i);
          })
        );
      }
    } catch (error) {
      if (error.response) {
        ApiError.parse(error.response);
      } else {
        BaseError.parse(error);
      }
    } finally {
      return users;
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
  //#region users

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
    getAllCollections,
    getCollections,
    getLinkedCollections,
    getTopCollections,
    getTopUsers,
    getUsers,
    getUsername,
    postLogin,
    postLogout,
    postPing,
    get,
    post,
    put,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useApiStore, import.meta.hot));
