import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "axios";
const apiKey = import.meta.env.VITE_ELYSIUM_API_KEY;
const apiSecret = import.meta.env.VITE_ELYSIUM_API_SECRET;
const hash = window.btoa(`${apiKey}:${apiSecret}`);
export const useApiStore = defineStore("api", () => {


  const get = async (url) => {
    return await axios.get(url, {
      headers: {
        'Authorization': `Basic ${hash}`
      }
    });
  };

  const post = async (url, data) => {
    return await axios.post(url, data, {
      headers: {
        'Authorization': `Basic ${hash}`
      }
    });
  };

  const put = async (url,data) => {
    return await axios.put(url, data, {
      headers: {
        'Authorization': `Basic ${hash}`
      }
    });
  };

  return {
    get,
    post,
    put
  };

});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useApiStore, import.meta.hot));
