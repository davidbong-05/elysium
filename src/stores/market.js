import { ethers } from "ethers";
import { acceptHMRUpdate, defineStore } from "pinia";
import marketContractABI from "../artifacts/contractABI/ElysiumNFTMarketplace.json";
import factoryContractABI from "../artifacts/contractABI/ElysiumNFTFactory.json";
import nftContractABI from "../artifacts/contractABI/ElysiumNFT.json";
import { ref } from "vue";
import axios from "axios";
import { useApiStore } from "@/stores/api";
import MetaMaskReponse from "@/models/metamask/metaMaskError";
import MetaMaskClient from "@/services/metaMaskClient";
import ConsoleUtils from "@/utils/consoleUtils";

const marketContractAddress = import.meta.env.VITE_MARKET_CONTRACT_ADDRESS;
const FACTORY_CONTRACT_ADDRESS = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS;
const apiKey = import.meta.env.VITE_PINATA_API_KEY;
const apiSecret = import.meta.env.VITE_PINATA_API_SECRET;

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

  const metaMaskClient = new MetaMaskClient(FACTORY_CONTRACT_ADDRESS, setAlert);

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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
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
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
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
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
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
      console.log(error);
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
      return MetaMaskReponse.parse(error);
    }
  };

  const getMyCollection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const factoryContract = new ethers.Contract(
          FACTORY_CONTRACT_ADDRESS,
          factoryContractABI.abi,
          signer
        );

        return await factoryContract.getOwnCollections();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      MetaMaskReponse.parse(error);
    }
  };

  const getCollectionDetails = async (collectionAddress) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const nftContract = new ethers.Contract(
          collectionAddress,
          nftContractABI.abi,
          provider
        );
        const totalSupply = await nftContract.totalSupply();
        let cover = "";
        if (totalSupply > 0) {
          cover = await getCollectionCover(collectionAddress);
        }
        const royaltyFee = await nftContract.getRoyalty();
        var royaltyRecipientAddress = await nftContract.getRoyaltyRecipient();
        const collection = {
          address: collectionAddress,
          cover: cover,
          owner: await nftContract.owner(),
          name: await nftContract.name(),
          symbol: await nftContract.symbol(),
          royalty: BigInt(royaltyFee).toString(),
          royaltyRecipient: royaltyRecipientAddress,
          royaltyRecipientName: (
            await get("/api/user/name/" + royaltyRecipientAddress)
          ).data,
          totalSupply: totalSupply.toString(),
        };
        console.log("collection", collection);
        return collection;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  };

  const getCollectionCover = async (tokenAddress) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const nftContract = new ethers.Contract(
          tokenAddress,
          nftContractABI.abi,
          provider
        );
        const tokenId = await nftContract.tokenByIndex(0);
        const tokenHash = await nftContract.tokenURI(tokenId);
        const meta = await getTokenMeta(tokenHash);
        const imgHash = meta.image;
        return (
          "https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/" + imgHash
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintNFT = async (ownerAddress, collectionAddress, tokenURI) => {
    console.log("collection", collectionAddress);
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const nftContract = new ethers.Contract(
          collectionAddress,
          nftContractABI.abi,
          signer
        );
        nftContract.on("Transfer", (from, to, tokenId) => {
          console.log(`Token ${tokenId} transferred from ${from} to ${to}`);
        });
        const tokenTxn = await nftContract.safeMint(ownerAddress, tokenURI);
        const receipt = await tokenTxn.wait();
        const tokenId = receipt.logs[0].topics[3];
        console.log(`TokenId: ${tokenId}`);
        return tokenId;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      MetaMaskReponse.parse(error);
      return error.code;
    }
  };

  const getOwnedNFTsCount = async (address) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const linkedCollection = await getLinkedCollection(address);

        var nftsCount = 0;
        for (const tokenAddress of linkedCollection) {
          try {
            const nftContract = new ethers.Contract(
              tokenAddress,
              nftContractABI.abi,
              provider
            );
            const balance = await nftContract.balanceOf(address);
            nftsCount += Number(balance);
            console.log(
              "Total NFTs owned (" + tokenAddress + "):" + balance.toString()
            );
          } catch (error) {
            console.log(
              "There's an issue with this address: " +
                tokenAddress +
                ":" +
                error
            );
            continue;
          }
        }
        return nftsCount;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getOwnedNFTs = async (address) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const linkedCollection = await getLinkedCollection(address);

        const nfts = [];
        for (const tokenAddress of linkedCollection) {
          try {
            const nftContract = new ethers.Contract(
              tokenAddress,
              nftContractABI.abi,
              provider
            );
            const balance = await nftContract.balanceOf(address);
            console.log("Total NFTs owned:", balance.toString());
            const royaltyFee = await nftContract.getRoyalty();
            const royaltyRecipient = await nftContract.getRoyaltyRecipient();
            for (let i = 0; i < balance; i++) {
              const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
              const owner = await nftContract.ownerOf(tokenId);
              const tokenHash = await nftContract.tokenURI(tokenId);
              console.log("Getting nft #" + i + " meta data...");
              const meta = await getTokenMeta(tokenHash);
              const imgHash = meta.image;
              let nft = {
                owner: owner,
                ownerName: (await get("/api/user/name/" + owner)).data,
                collection: tokenAddress,
                collectionName: await nftContract.name(),
                collectionOwner: royaltyRecipient,
                collectionOwnerName: (
                  await get("/api/user/name/" + royaltyRecipient)
                ).data,
                tokenId: tokenId.toString(),
                tokenUri:
                  "https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/" +
                  imgHash,
                tokenName: meta.name,
                tokenDescription: meta.description,
                royalty: royaltyFee.toString(),
              };
              nfts.push(nft);
            }
          } catch (error) {
            console.log("There's an issue with this address: " + tokenAddress);
            continue;
          }
        }
        if (nfts.length > 0) {
          return nfts;
        } else return null;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCollectionNFTs = async (tokenAddress) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const nfts = [];
        const nftContract = new ethers.Contract(
          tokenAddress,
          nftContractABI.abi,
          provider
        );
        const totalSupply = await nftContract.totalSupply();
        console.log("Total NFTs in collection:", totalSupply.toString());
        const royaltyFee = await nftContract.getRoyalty();
        for (let i = 0; i < totalSupply; i++) {
          const tokenId = await nftContract.tokenByIndex(i);
          const owner = await nftContract.ownerOf(tokenId);
          const tokenHash = await nftContract.tokenURI(tokenId);
          console.log("Getting nft #" + i + " meta data...");
          const meta = await getTokenMeta(tokenHash);
          const imgHash = meta.image;
          let nft = {
            owner: owner,
            ownerName: (await get("/api/user/name/" + owner)).data,
            collection: tokenAddress,
            collectionName: await nftContract.name(),
            tokenId: tokenId.toString(),
            tokenUri:
              "https://silver-outrageous-macaw-788.mypinata.cloud/ipfs/" +
              imgHash,
            tokenName: meta.name,
            tokenDescription: meta.description,
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
      console.log(error);
    }
  };

  const listNFT = async (tokenAddress, tokenId, price) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const marketContract = new ethers.Contract(
          marketContractAddress,
          marketContractABI.abi,
          signer
        );
        const nftContract = new ethers.Contract(
          tokenAddress,
          nftContractABI.abi,
          signer
        );
        const approveTxn = await nftContract.approve(
          marketContractAddress,
          tokenId
        );
        console.log("Approving transaction...");
        await approveTxn.wait();
        console.log("Approved!");
        const tokenTxn = await marketContract.listNft(
          tokenAddress,
          tokenId,
          ethers.parseUnits(price, "ether")
        );
        return await tokenTxn.wait();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      return error.code;
    }
  };

  const unListNFT = async (tokenAddress, tokenId) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const marketContract = new ethers.Contract(
          marketContractAddress,
          marketContractABI.abi,
          signer
        );
        const tokenTxn = await marketContract.cancelListNFT(
          tokenAddress,
          tokenId
        );
        return await tokenTxn.wait();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      return error.code;
    }
  };

  const getListedNFTs = async (collectionAddress) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const marketContract = new ethers.Contract(
          marketContractAddress,
          marketContractABI.abi,
          provider
        );
        const nftContract = new ethers.Contract(
          collectionAddress,
          nftContractABI.abi,
          provider
        );
        const nfts = [];
        const balance = await nftContract.balanceOf(marketContractAddress);
        console.log("Total NFTs listed:", balance.toString());
        const royaltyFee = await nftContract.getRoyalty();
        const royaltyRecipient = await nftContract.getRoyaltyRecipient();
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(
            marketContractAddress,
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
      console.log(error);
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
          marketContractAddress,
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
      console.log(error);
    }
  };
  const buyNFT = async (tokenAddress, tokenId, tokenPrice) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketContract = new ethers.Contract(
        marketContractAddress,
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
        marketContractAddress,
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
        console.log(err);
      }
    }
  };

  const getOwner = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketContract = new ethers.Contract(
        marketContractAddress,
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
        marketContractAddress,
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
        marketContractAddress,
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
        marketContractAddress,
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
        marketContractAddress,
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
    getCollectionDetails,
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
