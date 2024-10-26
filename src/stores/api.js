import { acceptHMRUpdate, defineStore } from "pinia";
import ApiClient from "@/services/apiClient";
import ApiTransaction from "@/models/transactions/apiTransaction";
import BaseError from "@/models/errors/baseError";
import ApiError from "@/models/errors/apiError";
import User from "@/models/user";
import ValidationUtils from "@/utils/validationUtils";
import { ApiResponseCode, ErrorCode, ErrorSource } from "@/models/enums";

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
    if (
      !ValidationUtils.checkIfParameterIsNullOrUndefined(
        "User address",
        userAddress
      )
    ) {
      return linkedCollections;
    }
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
      const res = await apiClient.get("/api/collection/top");
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

  const postLinkCollection = async (
    userAddress,
    collectionAddress,
    linkedCollections = null
  ) => {
    if (
      !linkedCollections &&
      linkedCollections.some(
        (linkedCollection) => linkedCollection.address === collectionAddress
      )
    ) {
      return new BaseError(
        ErrorSource.CLIENT,
        ErrorCode.CODE_ALREADY_LINKED,
        "Collection has already been linked previously."
      );
    }
    try {
      const data = {
        user_address: userAddress,
        collection_address: collectionAddress,
      };
      const res = await post(`/api/collection/link/`, data);
      return ApiTransaction.parse(res);
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };
  //#endregion nft collections

  //#region users
  const getTopUsers = async () => {
    let users = [];
    try {
      const res = await apiClient.get("/api/user/top");
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

  const getUser = async (userAddress) => {
    let user = null;
    if (
      !ValidationUtils.checkIfParameterIsNullOrUndefined(
        "User address",
        userAddress
      )
    ) {
      return user;
    }
    try {
      const res = await apiClient.get(`/api/user/${userAddress}`);
      const txn = ApiTransaction.parse(res);
      if (txn.isSuccess) {
        user = User.parse(txn.data);
      }
    } catch (error) {
      if (error.response) {
        ApiError.parse(error.response);
      } else {
        BaseError.parse(error);
      }
    } finally {
      return user;
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
    if (
      !ValidationUtils.checkIfParameterIsNullOrUndefined(
        "User address",
        userAddress
      )
    ) {
      return null;
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
    postLinkCollection,
    getTopUsers,
    getUser,
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
