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
      const res = await apiClient.get(`/api/collection/all`);
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
      const res = await apiClient.get(`/api/collection/`);
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
      const res = await apiClient.get(`/api/collection/${userAddress}`);
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
      const res = await apiClient.get(`/api/collection/top`);
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

  const putLinkCollection = async (
    userAddress,
    collectionAddress,
    linkedCollections = null
  ) => {
    if (
      linkedCollections !== null &&
      linkedCollections.some(
        (linkedCollection) => linkedCollection.address === collectionAddress
      )
    ) {
      return new BaseError(
        ErrorSource.CLIENT,
        ErrorCode.CODE_ALREADY_LINKED,
        `${collectionAddress} is has already been linked previously!`
      );
    }
    try {
      const data = {
        user_address: userAddress,
        collection_address: collectionAddress,
      };
      const res = await put(`/api/collection/link/`, data);
      return ApiTransaction.parse(res);
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };

  const putUnlinkCollection = async (
    userAddress,
    collectionAddress,
    linkedCollections = null
  ) => {
    if (
      linkedCollections !== null &&
      !linkedCollections.some(
        (linkedCollection) => linkedCollection.address === collectionAddress
      )
    ) {
      return new BaseError(
        ErrorSource.CLIENT,
        ErrorCode.CODE_NOT_LINKED,
        `${collectionAddress} is not linked previously!`
      );
    }
    try {
      const data = {
        user_address: userAddress,
        collection_address: collectionAddress,
      };
      const res = await put(`/api/collection/unlink/`, data);
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
      const res = await apiClient.get(`/api/user/top`);
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
      const res = await apiClient.get(`/api/user/`);
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

  const _usernames = [];

  const getAllUserNames = async () => {
    let usernames = [];
    try {
      const res = await apiClient.get(`/api/user/name/all`);
      const txn = ApiTransaction.parse(res);
      if (txn.isSuccess) {
        usernames = txn.data;
      }
    } catch (error) {
      if (error.response) {
        ApiError.parse(error.response);
      } else {
        BaseError.parse(error);
      }
    } finally {
      return usernames;
    }
  };
  const getUsername = async (userAddress) => {
    let username = null;

    if (
      !ValidationUtils.checkIfParameterIsNullOrUndefined(
        "User address",
        userAddress
      )
    ) {
      return username;
    }

    if (_usernames.length === 0) {
      _usernames.value = await getAllUserNames();
    }
    const user = _usernames.value.find((item) =>
      item.address.ignoreCaseEqual(userAddress)
    );

    if (user) {
      username = user.username;
    } else {
      try {
        const res = await apiClient.get(`/api/user/name/${userAddress}`);
        const txn = ApiTransaction.parse(res);
        const txnDetail = txn.getTransactionDetails();
        if (txnDetail.isSuccess) {
          username = txnDetail.data;
        }
      } catch (error) {
        if (error.response) {
          ApiError.parse(error.response);
        } else {
          BaseError.parse(error);
        }
      }
    }

    return username;
  };

  const postFollowUserCheck = async (userAddress, targetAddress) => {
    try {
      const data = {
        user_address: userAddress,
        target_address: targetAddress,
      };
      const res = await post("/api/user/follow/check", data);
      return ApiTransaction.parse(res);
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };

  const putFollowUser = async (userAddress, targetAddress) => {
    try {
      const data = {
        user_address: userAddress,
        target_address: targetAddress,
      };
      const res = await put("/api/user/follow", data);
      return ApiTransaction.parse(res);
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };

  const putUnfollowUser = async (userAddress, targetAddress) => {
    try {
      const data = {
        user_address: userAddress,
        target_address: targetAddress,
      };
      const res = await put("/api/user/unfollow", data);
      return ApiTransaction.parse(res);
    } catch (error) {
      if (error.response) {
        return ApiError.parse(error.response);
      } else {
        return BaseError.parse(error);
      }
    }
  };
  //#region users

  //#region auths
  const postLogin = async (address) => {
    try {
      const res = await apiClient.post(`/api/auth/login`, {
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
      const res = await apiClient.post(`/api/auth/logout`, {
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
      const res = await apiClient.post(`/api/auth/ping`, {
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

  const postSendVerificationEmail = async (email) => {
    if (!ValidationUtils.checkIfParameterIsNullOrUndefined("Email", email)) {
      return null;
    }
    try {
      const data = {
        email: email,
      };
      const res = await post(`/api/auth/send-verification-email`, data);
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
  //#endregion auths

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
    putLinkCollection,
    putUnlinkCollection,
    getTopUsers,
    getUser,
    getUsers,
    getUsername,
    postFollowUserCheck,
    putFollowUser,
    putUnfollowUser,
    postLogin,
    postLogout,
    postPing,
    postSendVerificationEmail,
    get,
    post,
    put,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useApiStore, import.meta.hot));
