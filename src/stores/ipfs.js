import { acceptHMRUpdate, defineStore } from "pinia";
import ApiClient from "@/services/apiClient";
import ApiTransaction from "@/models/transactions/apiTransaction";
import BaseError from "@/models/errors/baseError";
import ApiError from "@/models/errors/apiError";
import ValidationUtils from "@/utils/validationUtils";
import { useApiStore } from "@/stores/api";
import TokenMeta from "@/models/tokenMeta";

export const useIpfsStore = defineStore("ipfs", () => {
  const ipfsApiClient = new ApiClient(
    `https://silver-outrageous-macaw-788.mypinata.cloud/ipfs`
  );

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

    if (_tokenMetas.length === 0) {
      _tokenMetas.value = await getAllTokenMetas();
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
          const res2 = await postTokenMeta(tokenMeta);
          console.log(res2);
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
