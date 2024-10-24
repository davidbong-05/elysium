import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useApiStore } from "@/stores/api";
import MetaMaskError from "@/models/errors/metaMaskError";
import Nft from "@/models/nft";
import MetaMaskClient from "@/services/metaMaskClient";
import ConsoleUtils from "@/utils/consoleUtils";

const MARKET_CONTRACT_ADDRESS = import.meta.env.VITE_MARKET_CONTRACT_ADDRESS;
const FACTORY_CONTRACT_ADDRESS = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS;
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

export const useMarketStore = defineStore("user", () => {
  const account = ref(null);
  const loading = ref(false);
  const {
    postLogin,
    postLogout,
    postPing,
    getLinkedCollections,
    get,
    post,
    put,
  } = useApiStore();
  // function setLoader(boolean) {
  //   console.log("setLoader", value);
  //   loading.value = value;
  // }
  var alert = ref({
    show: false,
    color: "",
    icon: "",
    title: "",
    code: "",
    text: "",
  });

  const setAlert = (status, code, msg) => {
    var alertDetail = {
      code: code ? `[${code}]` : "",
      text: msg ? `${msg}.` : "",
    };
    switch (status) {
      case "error":
        alert = {
          ...alertDetail,
          show: true,
          color: "error",
          icon: "$error",
          title: "Oops...",
        };
        break;
      case "success":
        alert = {
          ...alertDetail,
          show: true,
          color: "success",
          icon: "$success",
          title: "Success",
        };
        break;
      case "info":
        alert = {
          ...alertDetail,
          show: true,
          color: "info",
          icon: "$info",
          title: "Info",
        };
        break;
      default:
        alert = { show: false };
        break;
    }
    console.log(`💬 (${alert.title}) ${alert.text} ${alert.code}`);
    return alert;
  };

  const metaMaskClient = new MetaMaskClient(
    FACTORY_CONTRACT_ADDRESS,
    MARKET_CONTRACT_ADDRESS,
    setAlert
  );

  const connectWallet = async () => {
    try {
      account.value = await metaMaskClient.connectWallet();
    } catch (error) {
      setAlert("error", error.code, error.message);
      ConsoleUtils.displayError(error);
    }
  };

  const login = async (address) => {
    const res = await postLogin(address);

    if (res.isSuccess) {
      sessionStorage.setItem("address", address);
      sessionStorage.setItem("username", res.data.username);
      sessionStorage.setItem("pfp", res.data.profile_url);
      sessionStorage.setItem("role", res.data.role ?? "unverified-user");
      sessionStorage.setItem("session_id", res.data.session_id);
    }
    return res;
  };

  const logout = async () => {
    try {
      const res = await postLogout(
        sessionStorage.getItem("address"),
        sessionStorage.getItem("session_id")
      );
      if (res.isSuccess) {
        sessionStorage.clear();
      }
    } catch (err) {
      ConsoleUtils.displayError(error);
    }
  };

  const ping = async () => {
    await postPing(
      sessionStorage.getItem("address"),
      sessionStorage.getItem("session_id")
    );
  };

  const linkCollection = async (user_address, address) => {
    let newCollections = await getLinkedCollections(user_address);
    if (newCollections.length > 0) {
      if (newCollections.includes(address)) {
        return "Already Linked";
      } else {
        newCollections.push(address);
      }
    } else {
      newCollections = address;
    }
    const data = {
      user_address: user_address,
      nft_collection: newCollections,
    };
    console.log(newCollections);

    try {
      const res = await put("/api/collection/", data);
      if (res.data === "404") {
        const newCollection = await post("/api/collection/", data);
        console.log("new collection", newCollection);
      }
      return 200;
    } catch (error) {
      ConsoleUtils.displayError(error);

      return "Something went wrong...";
    }
  };

  const getAllLinkedCollection = async () => {
    try {
      const res = await get("/api/collection/");
      if (res.status === 200) {
        return res.data;
      }
    } catch (err) {
      if (err.response.status === 404) {
        return [];
      }
      ConsoleUtils.displayError(error);
    }
  };

  const unlinkCollection = async (user_address, tokenIndex) => {
    let newCollections = await getLinkedCollections(user_address);
    newCollections.splice(tokenIndex, 1);
    const data = {
      user_address: user_address,
      nft_collection: newCollections,
    };
    try {
      const res = await put("/api/collection/", data);
      console.log("res", res);
      return 200;
    } catch (err) {
      ConsoleUtils.displayError(error);

      return "Something went wrong...";
    }
  };

  const uploadFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );

    return res.data;
  };

  const uploadJSONToIPFS = async (json) => {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      json,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );
    return res.data;
  };

  const getTokenMeta = async (tokenHash) => {
    try {
      const res = await axios.get(
        "https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/" + tokenHash
      );
      return res.data;
    } catch (error) {
      ConsoleUtils.displayError(error);
    }
  };

  const createNFTCollection = async (
    name,
    symbol,
    royaltyFee,
    royaltyRecipient
  ) => {
    try {
      return await metaMaskClient.createNftCollection(
        name,
        symbol,
        royaltyFee,
        royaltyRecipient
      );
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const getMyCollection = async () => {
    try {
      return await metaMaskClient.getOwnNftCollections();
    } catch (error) {
      MetaMaskError.parse(error);
    }
  };

  const getNftCollection = async (collectionAddress) => {
    let nftCollection = null;
    try {
      nftCollection = await metaMaskClient.getNftCollection(collectionAddress);
    } catch (error) {
      console.warn(`Error while fetching${collectionAddress}`);
      MetaMaskError.parse(error);
    }
    if (nftCollection) {
      try {
        if (nftCollection.totalSupply > 0) {
          const cover = await getCollectionCover(collectionAddress);
          nftCollection.setCover(cover);
        }
        const res = await get(
          "/api/user/name/" + nftCollection.royaltyRecipient
        );
        nftCollection.setRoyaltyRecipientName(res.data);
      } catch (error) {
        ConsoleUtils.displayError(error);
      }
    }
    return nftCollection;
  };

  const getCollectionCover = async (collectionAddress) => {
    try {
      const tokenHash = await metaMaskClient.getTokenHash(collectionAddress, 0);
      const meta = await getTokenMeta(tokenHash);
      const imgHash = meta.image;
      return (
        "https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/" + imgHash
      );
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const mintNFT = async (ownerAddress, collectionAddress, tokenURI) => {
    try {
      return await metaMaskClient.createNft(
        ownerAddress,
        collectionAddress,
        tokenURI
      );
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const getOwnedNFTsCount = async (address) => {
    let totalCount = 0;
    let linkedCollection = [];
    try {
      linkedCollection = await getLinkedCollections(address);
    } catch (error) {
      ConsoleUtils.displayError(error);
    }

    try {
      for (const collectionAddress of linkedCollection) {
        const count = await metaMaskClient.getOwnedNftCounts(
          address,
          collectionAddress
        );
        totalCount += count;
      }
    } catch (error) {
      MetaMaskError.parse(error);
    }
    console.log(`🎯 Total NFTs owned by ${address}: ${totalCount}`);
    return totalCount;
  };

  const getOwnedNFTs = async (ownerAddress) => {
    let nfts = [];
    let linkedCollection = [];
    try {
      linkedCollection = await getLinkedCollections(ownerAddress);
    } catch (error) {
      ConsoleUtils.displayError(error);
    }

    try {
      for (const collectionAddress of linkedCollection) {
        const count = await metaMaskClient.getOwnedNftCounts(
          ownerAddress,
          collectionAddress
        );
        for (let i = 0; i < count; i++) {
          const nft = await getNft(ownerAddress, collectionAddress, i);
          if (nft) {
            nfts.push(nft);
          }
        }
      }
    } catch (error) {
      ConsoleUtils.displayError(error);
    } finally {
      return nfts;
    }
  };

  const getCollectionNFTs = async (collectionAddress) => {
    let nfts = [];
    try {
      const count = await metaMaskClient.getCollectionNftCounts(
        collectionAddress
      );
      for (let i = 0; i < count; i++) {
        const nft = await getNft(null, collectionAddress, i);
        if (nft) {
          nfts.push(nft);
        }
      }
    } catch (error) {
      ConsoleUtils.displayError(error);
    } finally {
      return nfts;
    }
  };

  const getNft = async (ownerAddress, collectionAddress, i) => {
    let nft = null;
    try {
      nft = await metaMaskClient.getOwnedNft(
        ownerAddress,
        collectionAddress,
        i
      );
      const meta = await getTokenMeta(nft.tokenHash);
      const imgHash = meta.image;
      const ownerName = (await get("/api/user/name/" + ownerAddress)).data;
      const collectionOwnerName = (
        await get("/api/user/name/" + nft.collectionOwner)
      ).data;
      const tokenUri = `https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/${imgHash}`;
      nft = new Nft({
        ...nft,
        ownerName: ownerName,
        collectionOwnerName: collectionOwnerName,
        tokenName: meta.name,
        tokenDescription: meta.description,
        tokenUri: tokenUri,
      });
      nft.displayInfo();
    } catch (error) {
      ConsoleUtils.displayError(error);
    } finally {
      return nft;
    }
  };

  const listNFT = async (collectionAddress, tokenId, price) => {
    try {
      return await metaMaskClient.listNft(collectionAddress, tokenId, price);
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const unListNFT = async (collectionAddress, tokenId) => {
    try {
      return await metaMaskClient.unlistNft(collectionAddress, tokenId);
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const getListedNFTs = async (collectionAddress) => {
    let nfts = [];
    let count = 0;
    try {
      try {
        count = await metaMaskClient.getOwnedNftCounts(
          MARKET_CONTRACT_ADDRESS,
          collectionAddress
        );
      } catch (error) {
        MetaMaskError.parse(error);
      }

      for (let i = 0; i < count; i++) {
        const nft = await getListedNft(collectionAddress, i);
        if (nft) {
          nfts.push(nft);
        }
      }
    } catch (error) {
      ConsoleUtils.displayError(error);
    } finally {
      return nfts;
    }
  };

  const getListedNft = async (collectionAddress, i) => {
    let nft = null;
    try {
      nft = await metaMaskClient.getListedNft(collectionAddress, i);
      const meta = await getTokenMeta(nft.tokenHash);
      const imgHash = meta.image;
      const sellerName = (await get("/api/user/name/" + nft.seller)).data;
      const collectionOwnerName = (
        await get("/api/user/name/" + nft.collectionOwner)
      ).data;
      const tokenUri = `https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/${imgHash}`;
      nft = new Nft({
        ...nft,
        sellerName: sellerName,
        collectionOwnerName: collectionOwnerName,
        tokenName: meta.name,
        tokenDescription: meta.description,
        tokenUri: tokenUri,
      });
      nft.displayInfo();
    } catch (error) {
      ConsoleUtils.displayError(error);
    } finally {
      return nft;
    }
  };

  const getUserListedNFTs = async (address) => {
    let nfts = [];
    let allListedNfts = [];
    try {
      const collectionAddress = await getLinkedCollections(address);
      for (const collection of collectionAddress) {
        const res = await getListedNFTs(collection);
        if (res && res.length > 0) {
          allListedNfts = allListedNfts.concat(res);
        }
      }
      for (const nft of allListedNfts) {
        console.log("Searching for nfts listed by user...");
        if (nft.seller.toLowerCase() === address.toLowerCase()) {
          nfts.push(nft);
        }
      }
    } catch (error) {
      ConsoleUtils.displayError(error);
    } finally {
      return nfts;
    }
  };

  const getCartNFTs = async (cartItems) => {
    let nfts = [];
    try {
      const count = await metaMaskClient.getCollectionNftCounts(
        collectionAddress
      );
      for (const cartItem of cartItems) {
        const nft = await getNft(null, cartItem.collection, cartItem.tokenId);
        if (nft) {
          nfts.push(nft);
        }
      }
    } catch (error) {
      ConsoleUtils.displayError(error);
    } finally {
      return nfts;
    }
  };

  const buyNFT = async (collectionAddress, tokenId, price) => {
    try {
      return await metaMaskClient.buyNft(collectionAddress, tokenId, price);
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const checkoutNFTs = async (cartItems) => {
    try {
      const res = await metaMaskClient.checkoutNFTs(cartItems);
      for (const cartItem of cartItems) {
        linkCollection(
          sessionStorage.getItem("address"),
          cartItem.collectionAddress
        );
      }
      return res;
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };
  // #region admin
  const getOwner = async () => {
    try {
      return await metaMaskClient.getOwner();
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const getPlatformFee = async () => {
    try {
      return await metaMaskClient.getPlatformFee();
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const getPlatformFeeRecipient = async () => {
    try {
      return await metaMaskClient.getPlatformFeeRecipient();
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };
  const updatePlatformFee = async (newPlatformFee) => {
    try {
      return await metaMaskClient.updatePlatformFee(newPlatformFee);
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };
  const changeFeeRecipient = async (newFeeRecipient) => {
    try {
      return await metaMaskClient.changeFeeRecipient(newFeeRecipient);
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };
  // #endregion admin

  return {
    account,
    // setLoader,
    loading,
    // market,
    setAlert,
    connectWallet,
    login,
    logout,
    ping,
    linkCollection,
    getAllLinkedCollection,
    unlinkCollection,
    uploadFileToIPFS,
    uploadJSONToIPFS,
    createNFTCollection,
    getMyCollection,
    getNftCollection,
    mintNFT,
    getOwnedNFTs,
    getOwnedNFTsCount,
    getCollectionNFTs,
    listNFT,
    unListNFT,
    getListedNFTs,
    getUserListedNFTs,
    getCartNFTs,
    buyNFT,
    checkoutNFTs,
    getOwner,
    getPlatformFee,
    getPlatformFeeRecipient,
    updatePlatformFee,
    changeFeeRecipient,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMarketStore, import.meta.hot));
