import { ethers } from "ethers";
import { acceptHMRUpdate, defineStore } from "pinia";
import marketContractABI from "../artifacts/contractABI/ElysiumNFTMarketplace.json";
import factoryContractABI from "../artifacts/contractABI/ElysiumNFTFactory.json";
import nftContractABI from "../artifacts/contractABI/ElysiumNFT.json";
import { ref } from "vue";
import axios from "axios";
import { useApiStore } from "@/stores/api";
import MetaMaskError from "@/models/metamask/metaMaskError";
import Nft from "@/models/nft";
import MetaMaskClient from "@/services/metaMaskClient";
import ConsoleUtils from "@/utils/consoleUtils";

const MARKET_CONTRACT_ADDRESS = import.meta.env.VITE_MARKET_CONTRACT_ADDRESS;
const FACTORY_CONTRACT_ADDRESS = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS;
const API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

export const useMarketStore = defineStore("user", () => {
  const account = ref(null);
  const loading = ref(false);
  const { get, post, put } = useApiStore();
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
    const res = await post("/api/auth/login", {
      user_address: address,
    });

    if (res.status === 200) {
      sessionStorage.setItem("address", address);
      sessionStorage.setItem("username", res.data.username);
      sessionStorage.setItem("pfp", res.data.profile_url);
      sessionStorage.setItem("role", res.data.role ?? "unverified-user");
      sessionStorage.setItem("session_id", res.data.session_id);
    }
    return res.status;
  };
  const logout = async () => {
    try {
      const res = await post("/api/auth/logout", {
        user_address: sessionStorage.getItem("address"),
        session_id: sessionStorage.getItem("session_id"),
      });
      sessionStorage.clear();
      console.log(res);
    } catch (err) {
      ConsoleUtils.displayError(error);

      console.log(err.response.message);
    }
  };

  const ping = async () => {
    try {
      const res = await post("/api/auth/ping", {
        user_address: sessionStorage.getItem("address"),
        session_id: sessionStorage.getItem("session_id"),
      });
    } catch (err) {
      ConsoleUtils.displayError(error);

      console.log(err.response.message);
    }
  };

  const linkCollection = async (user_address, address) => {
    let newCollections = await getLinkedCollection(user_address);
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
    } catch (err) {
      ConsoleUtils.displayError(error);

      return "Something went wrong...";
    }
  };

  const getLinkedCollection = async (user_address) => {
    try {
      const res = await get("/api/collection/" + user_address);
      if (res.status === 200) return res.data;
    } catch (err) {
      if (err.response.status === 404) {
        return [];
      }
      ConsoleUtils.displayError(error);
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
    let newCollections = await getLinkedCollection(user_address);
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
          pinata_api_key: API_KEY,
          pinata_secret_api_key: API_SECRET,
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
          pinata_api_key: API_KEY,
          pinata_secret_api_key: API_SECRET,
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
        const royaltyRecipientName = await get(
          "/api/user/name/" + nftCollection.royaltyRecipient
        ).data;
        nftCollection.setRoyaltyRecipientName(royaltyRecipientName);
      } catch (error) {
        ConsoleUtils.displayError(error);
      }
    }
    return nftCollection;
  };

  const getCollectionCover = async (tokenAddress) => {
    try {
      const tokenHash = await metaMaskClient.getTokenHash(tokenAddress, 0);
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
      linkedCollection = await getLinkedCollection(address);
    } catch (error) {
      ConsoleUtils.displayError(error);
    }

    try {
      for (const tokenAddress of linkedCollection) {
        const count = await metaMaskClient.getOwnedNftCounts(
          address,
          tokenAddress
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
      linkedCollection = await getLinkedCollection(ownerAddress);
    } catch (error) {
      ConsoleUtils.displayError(error);
    }

    try {
      for (const tokenAddress of linkedCollection) {
        const count = await metaMaskClient.getOwnedNftCounts(
          ownerAddress,
          tokenAddress
        );
        for (let i = 0; i < count; i++) {
          const nft = await getNft(ownerAddress, tokenAddress, i);
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

  const getCollectionNFTs = async (tokenAddress) => {
    let nfts = [];
    try {
      const count = await metaMaskClient.getCollectionNftCounts(tokenAddress);
      for (let i = 0; i < count; i++) {
        const nft = await getNft(null, tokenAddress, i);
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

  const getNft = async (ownerAddress, tokenAddress, i) => {
    let nft = null;
    try {
      nft = await metaMaskClient.getOwnedNft(ownerAddress, tokenAddress, i);
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

  const listNFT = async (tokenAddress, tokenId, price) => {
    try {
      return await metaMaskClient.listNft(tokenAddress, tokenId, price);
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const unListNFT = async (tokenAddress, tokenId) => {
    try {
      return await metaMaskClient.unlistNft(tokenAddress, tokenId);
    } catch (error) {
      return MetaMaskError.parse(error);
    }
  };

  const getListedNFTs = async (collectionAddress) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const marketContract = new ethers.Contract(
          MARKET_CONTRACT_ADDRESS,
          marketContractABI.abi,
          provider
        );
        const nftContract = new ethers.Contract(
          collectionAddress,
          nftContractABI.abi,
          provider
        );
        const nfts = [];
        const balance = await nftContract.balanceOf(MARKET_CONTRACT_ADDRESS);
        console.log("Total NFTs listed:", balance.toString());
        const royaltyFee = await nftContract.getRoyalty();
        const royaltyRecipient = await nftContract.getRoyaltyRecipient();
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(
            MARKET_CONTRACT_ADDRESS,
            i
          );
          const marketItem = await marketContract.getListedNFT(
            collectionAddress,
            tokenId
          );
          const tokenHash = await nftContract.tokenURI(tokenId);
          console.log("Getting nft #" + i + " meta data...");
          const meta = await getTokenMeta(tokenHash);
          const imgHash = meta.image;
          var nftContractOwnerAddress = await nftContract.ownerOf(tokenId);
          let nft = {
            seller: marketItem.seller,
            sellerName: (await get("/api/user/name/" + marketItem.seller)).data,
            tokenId: tokenId.toString(),
            price: ethers.formatUnits(marketItem.price.toString(), "ether"),
            tokenUri:
              "https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/" +
              imgHash,
            tokenName: meta.name,
            tokenDescription: meta.description,
            collection: collectionAddress,
            collectionName: await nftContract.name(),
            collectionOwner: royaltyRecipient,
            collectionOwnerName: (
              await get("/api/user/name/" + royaltyRecipient)
            ).data,
            royalty: royaltyFee.toString(),
          };
          nfts.push(nft);
        }
        if (nfts.length > 0) {
          return nfts;
        } else return null;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      ConsoleUtils.displayError(error);
    }
  };

  const getUserListedNFTs = async (address) => {
    let allNfts = [];
    let nfts = [];
    const collectionAddress = await getLinkedCollection(address);
    for (const collection of collectionAddress) {
      const res = await getListedNFTs(collection);
      if (res) {
        allNfts = allNfts.concat(res);
      }
    }
    if (allNfts.length > 0) {
      for (const nft of allNfts) {
        console.log("Searching for nfts listed by user...");
        if (nft.seller.toLowerCase() === address.toLowerCase()) {
          nfts.push(nft);
        }
      }
      return nfts;
    } else return null;
  };

  const getCartNFTs = async (cartContent) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const marketContract = new ethers.Contract(
          MARKET_CONTRACT_ADDRESS,
          marketContractABI.abi,
          provider
        );
        const nfts = [];
        for (const item of cartContent) {
          const nftContract = new ethers.Contract(
            item.collection,
            nftContractABI.abi,
            provider
          );
          const marketItem = await marketContract.getListedNFT(
            item.collection,
            item.tokenId
          );
          const tokenHash = await nftContract.tokenURI(item.tokenId);
          const meta = await getTokenMeta(tokenHash);
          const imgHash = meta.image;
          let nft = {
            collectionAddress: item.collection,
            collectionName: await nftContract.name(),
            seller: marketItem.seller,
            tokenId: item.tokenId,
            price: ethers.formatUnits(marketItem.price.toString(), "ether"),
            tokenUri:
              "https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/" +
              imgHash,
            tokenName: meta.name,
            tokenDescription: meta.description,
          };
          nfts.push(nft);
        }
        if (nfts.length > 0) {
          return nfts;
        } else return null;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      ConsoleUtils.displayError(error);
    }
  };
  const buyNFT = async (tokenAddress, tokenId, tokenPrice) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketContract = new ethers.Contract(
        MARKET_CONTRACT_ADDRESS,
        marketContractABI.abi,
        signer
      );
      const price = ethers.parseUnits(tokenPrice, "ether");
      try {
        const tokenTxn = await marketContract.buyNFT(tokenAddress, tokenId, {
          value: price,
        });
        return tokenTxn;
      } catch (err) {
        return err.code;
      }
    }
  };

  const checkoutNFTs = async (cartItems, totalPrice) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketContract = new ethers.Contract(
        MARKET_CONTRACT_ADDRESS,
        marketContractABI.abi,
        signer
      );
      const tokenAddresses = [];
      const tokenIds = [];
      const tokenPrices = [];

      for (const item of cartItems) {
        tokenAddresses.push(item.collectionAddress);
        tokenIds.push(item.tokenId);
        tokenPrices.push(ethers.parseUnits(item.price, "ether"));
      }

      const price = ethers.parseUnits(totalPrice, "ether");

      try {
        const tokenTxn = await marketContract.buyBulkNFTs(
          tokenAddresses,
          tokenIds,
          {
            value: price,
          }
        );
        await tokenTxn.wait();
        for (const tokenAdress of tokenAddresses) {
          linkCollection(sessionStorage.getItem("address"), tokenAdress);
        }
      } catch (err) {
        ConsoleUtils.displayError(error);
      }
    }
  };

  const getOwner = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketContract = new ethers.Contract(
        MARKET_CONTRACT_ADDRESS,
        marketContractABI.abi,
        provider
      );
      return await marketContract.owner();
    }
  };

  const getPlatformFee = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketContract = new ethers.Contract(
        MARKET_CONTRACT_ADDRESS,
        marketContractABI.abi,
        provider
      );
      const fee = await marketContract.getPlatformFee();
      return ethers.formatUnits(fee.toString(), "ether");
    }
  };

  const getPlatformFeeRecipient = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketContract = new ethers.Contract(
        MARKET_CONTRACT_ADDRESS,
        marketContractABI.abi,
        provider
      );
      return await marketContract.getFeeRecipient();
    }
  };
  const updatePlatformFee = async (newPlatformFee) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketContract = new ethers.Contract(
        MARKET_CONTRACT_ADDRESS,
        marketContractABI.abi,
        signer
      );
      return await marketContract.updatePlatformFee(
        ethers.parseUnits(newPlatformFee.toString(), "ether")
      );
    }
  };
  const changeFeeRecipient = async (newFeeRecipient) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketContract = new ethers.Contract(
        MARKET_CONTRACT_ADDRESS,
        marketContractABI.abi,
        signer
      );
      return await marketContract.changeFeeRecipient(newFeeRecipient);
    }
  };

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
    getLinkedCollection,
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
