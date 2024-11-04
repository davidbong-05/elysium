import { acceptHMRUpdate, defineStore } from "pinia";
import ApiClient from "@/services/apiClient.js";
import ApiTransaction from "@/models/transactions/apiTransaction.js";
import BaseError from "@/models/errors/baseError.js";
import ApiError from "@/models/errors/apiError.js";
import ValidationUtils from "@/utils/validationUtils.js";
import { useApiStore } from "@/stores/api.js";
import TokenMeta from "@/models/tokenMeta.js";
import TokenMetaIndexDbService from "@/services/tokenMetaIndexDbService";

export const useIpfsStore = defineStore("ipfs", () => {
  const ipfsApiClient = new ApiClient(
    `https://silver-outrageous-macaw-788.mypinata.cloud/ipfs`
  );

  const tokenMetaIndexDbService = new TokenMetaIndexDbService();

  const { getAllTokenMetas, postTokenMeta } = useApiStore();

  const _tokenMetas = [];

  const getTokenMeta = async (tokenHash) => {
    let tokenMeta = null;

    if (
      !ValidationUtils.checkIfParameterIsNullOrUndefined(
        "Collection address",
        tokenHash
      )
    ) {
      return tokenMeta;
    }

    if (!_tokenMetas.value) {
      _tokenMetas.value = await tokenMetaIndexDbService.getAllTokenMetas();
    }
    const token = _tokenMetas?.value?.find((item) =>
      item.hash.ignoreCaseEqual(tokenHash)
    );
    if (token) {
      tokenMeta = token;
    } else {
      try {
        const res = await ipfsApiClient.get(`/${tokenHash}`);
        const txn = ApiTransaction.parse(res);
        const txnDetail = txn.getTransactionDetails();
        if (txnDetail.isSuccess) {
          tokenMeta = TokenMeta.parse(txnDetail.data);
          tokenMeta.setTokenHash(tokenHash);
          await tokenMetaIndexDbService.addTokenMeta(tokenMeta);
        }
      } catch (error) {
        if (error.response) {
          ApiError.parse(error.response);
        } else {
          BaseError.parse(error);
        }
      }
    }

    return tokenMeta;
  };

  return {
    getTokenMeta,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useIpfsStore, import.meta.hot));
