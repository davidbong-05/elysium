import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "axios";
import ApiClient from "@/services/apiClient";
import ConsoleUtils from "@/utils/consoleUtils";

const SERVER_API_KEY = import.meta.env.VITE_ELYSIUM_API_KEY;
const SERVER_API_SECRET = import.meta.env.VITE_ELYSIUM_API_SECRET;
const HASH = window.btoa(`${SERVER_API_KEY}:${SERVER_API_SECRET}`);

export const useApiStore = defineStore("api", () => {
  const apiClient = new ApiClient(null, { Authorization: `Basic ${HASH}` });

  const postLogin = async (address) => {
    return await apiClient.post("/api/auth/login", {
      user_address: address,
    });
  };

  const postLogout = async (userAddress, sessionId) => {
    return await apiClient.post("/api/auth/logout", {
      user_address: userAddress,
      session_id: sessionId,
    });
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
    get,
    post,
    put,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useApiStore, import.meta.hot));
