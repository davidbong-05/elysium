import factoryContractABI from "../artifacts/contractABI/ElysiumNFTFactory.json";
import marketContractABI from "../artifacts/contractABI/ElysiumNFTMarketplace.json";
import nftContractABI from "../artifacts/contractABI/ElysiumNFT.json";
import { ethers } from "ethers";
import MetaMaskReponse from "@/models/errors/metaMaskError.js";
import EthereumTransaction from "@/models/transactions/ethereumTransaction.js";
import Nft from "@/models/nft.js";
import NftColletion from "@/models/nftCollection.js";

class MetaMaskClient {
  constructor(factoryContractAddress, marketContractAddress) {
    this.factoryContractAddress = factoryContractAddress;
    this.marketContractAddress = marketContractAddress;
    this.displayInfo();
  }

  displayInfo() {
    console.log(`✨ Factory Contract Address: ${this.factoryContractAddress}`);
  }

  static POLYGON_NETWORK = {
    chainId: "0x13882",
    chainName: "POLYGON AMOY TESTNET",
    nativeCurrency: {
      name: "POL",
      symbol: "POL",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    blockExplorerUrls: ["https://www.oklink.com/amoy"],
  };

  connectWallet = async () => {
    await this.ensureMetaMaskIsInstalled();
    await this.ensureNetworkIsCorrect();
    console.log(`🧹 connecting to wallet.`);
    const res = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log(`✨ wallet connected. Wallet Address:${res}`);
    return res[0];
  };

  ensureMetaMaskIsInstalled = async () => {
    if (!window.ethereum) {
      console.log(`⚠️ MetaMask is either not installed or not connected.`);
    }
  };

  ensureNetworkIsCorrect = async () => {
    console.log(`🧹 ensuring connected chain is correct.`);
    const walletChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    if (walletChainId != MetaMaskClient.POLYGON_NETWORK.chainId) {
      await this.switchNetwork();
    }
  };

  switchNetwork = async () => {
    try {
      console.log(
        `🧹 switching chain to ${MetaMaskClient.POLYGON_NETWORK.chainId}`
      );
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MetaMaskClient.POLYGON_NETWORK.chainId }],
      });
    } catch (error) {
      var switchError = MetaMaskReponse.parse(error);
      if (switchError.isChainNotAddedError()) {
        await this.addChain();
      } else {
        throw error;
      }
    }
  };

  addChain = async () => {
    console.log(
      `🧹 adding chain ${MetaMaskClient.POLYGON_NETWORK.chainName} ${MetaMaskClient.POLYGON_NETWORK.chainId}`
    );
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [POLYGON_NETWORK],
    });
  };

  createNftCollection = async (name, symbol, royaltyFee, royaltyRecipient) => {
    console.log(`⚒️  Creating a new collection:`);
    console.log(`------------------------------`);
    console.log(`📛 Name:               ${name}`);
    console.log(`💠 Symbol:             ${symbol}`);
    console.log(`💸 Royalty Fee:        ${royaltyFee}%`);
    console.log(`👑 Royalty Recipient:  ${royaltyRecipient}`);
    console.log(`------------------------------`);
    console.log(`🚀 Collection is being created.`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const factoryContract = new ethers.Contract(
      this.factoryContractAddress,
      factoryContractABI.abi,
      signer
    );

    const collectionTxn = await factoryContract.createNFTCollection(
      name,
      symbol,
      royaltyFee,
      royaltyRecipient
    );

    const res = await collectionTxn.wait();
    const txn = EthereumTransaction.parse(res);
    return txn.getTransactionDetails();
  };

  createNft = async (ownerAddress, collectionAddress, tokenURI) => {
    console.log(`⚒️  Minting a new NFT:`);
    console.log(`------------------------------`);
    console.log(`📛 Owner:               ${ownerAddress}`);
    console.log(`🏛️ Collection Address:   ${collectionAddress}`);
    console.log(`🖼️ Token URI:            ${tokenURI}`);
    console.log(`------------------------------`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(
      collectionAddress,
      nftContractABI.abi,
      signer
    );

    const transferListener = (from, to, tokenId) => {
      console.log(
        `🚚 Token ${tokenId.toString()} transferred from ${from} to ${to}`
      );
    };

    nftContract.on("Transfer", transferListener);

    const tokenTxn = await nftContract.safeMint(ownerAddress, tokenURI);
    console.log("⏳ Minting transaction sent.");

    const res = await tokenTxn.wait();
    console.log("✅ Transaction confirmed!");

    const tokenIdHex = res.logs[0].topics[3];
    console.log(`🎉 Token minted! TokenId: ${tokenIdHex}`);

    nftContract.off("Transfer", transferListener);

    const txn = EthereumTransaction.parse(res);
    return txn.getTransactionDetails();
  };

  listNft = async (collectionAddress, tokenId, price) => {
    console.log(`📝 Listing NFT for sale:`);
    console.log(`------------------------------`);
    console.log(`🏛️ Collection Address: ${collectionAddress}`);
    console.log(`🆔 Token ID:           ${tokenId}`);
    console.log(`💲 Listing Price:       ${price} ETH`);
    console.log(`------------------------------`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      signer
    );
    const nftContract = new ethers.Contract(
      collectionAddress,
      nftContractABI.abi,
      signer
    );

    console.log("🔑 Approving marketplace to handle NFT.");
    const approveTxn = await nftContract.approve(
      this.marketContractAddress,
      tokenId
    );

    console.log("⏳ Approving transaction sent.");
    await approveTxn.wait();
    console.log("✅ Approval transaction confirmed!");

    console.log("🔨 Listing NFT on marketplace.");
    const listingTxn = await marketContract.listNft(
      collectionAddress,
      tokenId,
      ethers.parseUnits(price, "ether")
    );

    console.log("⏳ Listing transaction sent.");
    const res = await listingTxn.wait();
    console.log("✅ NFT successfully listed!");

    const txn = EthereumTransaction.parse(res);
    return txn.getTransactionDetails();
  };

  unlistNft = async (collectionAddress, tokenId) => {
    console.log(`📝 Unlisting NFT from marketplace:`);
    console.log(`------------------------------`);
    console.log(`🏛️ Collection Address: ${collectionAddress}`);
    console.log(`🆔 Token ID:           ${tokenId}`);
    console.log(`------------------------------`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      signer
    );

    console.log("🔨 Unlisting NFT on marketplace.");
    const cancellingTxn = await marketContract.cancelListNFT(
      collectionAddress,
      tokenId
    );

    console.log("⏳ Unlisting transaction sent.");
    const res = await cancellingTxn.wait();
    console.log("✅ NFT successfully unlisted!");

    const txn = EthereumTransaction.parse(res);
    return txn.getTransactionDetails();
  };

  buyNft = async (collectionAddress, tokenId, price) => {
    console.log(`📝 Buying NFT from marketplace:`);
    console.log(`------------------------------`);
    console.log(`🏛️ Collection Address: ${collectionAddress}`);
    console.log(`🆔 Token ID:           ${tokenId}`);
    console.log(`💲 Listing Price:       ${price} ETH`);
    console.log(`------------------------------`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      signer
    );
    const tokenPrice = ethers.parseUnits(price, "ether");

    console.log("💵 Buying NFT on marketplace.");
    const buyingTxn = await marketContract.buyNFT(collectionAddress, tokenId, {
      value: tokenPrice,
    });

    console.log("⏳ Buying transaction sent.");
    const res = await buyingTxn.wait();
    console.log("✅ NFT successfully bought!");

    const txn = EthereumTransaction.parse(res);
    return txn.getTransactionDetails();
  };

  checkoutNFTs = async (cartItems) => {
    const collectionAddresses = [];
    const tokenIds = [];
    let totalPrice = 0;

    console.log(`📝 Checking out NFTs from marketplace:`);
    console.log(`------------------------------`);

    cartItems.forEach((cartItem) => {
      console.log(
        `🏛️ Collection: ${cartItem.collectionAddress}, Token ID: ${cartItem.tokenId} (${cartItem.price} ETH)`
      );
      collectionAddresses.push(cartItem.collectionAddress);
      tokenIds.push(cartItem.tokenId);
      totalPrice += parseFloat(cartItem.price); // Ensure prices are properly handled as numbers
    });

    console.log(`------------------------------`);
    console.log(`💲 Total Price:       ${totalPrice} ETH`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      signer
    );
    const price = ethers.parseUnits(totalPrice.toString(), "ether");

    console.log(`💰 Proceeding with the purchase...`);
    const tokenTxn = await marketContract.buyBulkNFTs(
      collectionAddresses,
      tokenIds,
      {
        value: price,
      }
    );

    console.log(`⏳ Transaction sent, awaiting confirmation...`);
    const res = await tokenTxn.wait();
    console.log(`✅ Transaction successful!`);

    const txn = EthereumTransaction.parse(res);
    return txn.getTransactionDetails();
  };

  getOwnNftCollections = async () => {
    console.log(`🧹 getting own NFT collections.`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const factoryContract = new ethers.Contract(
      this.factoryContractAddress,
      factoryContractABI.abi,
      signer
    );
    return await factoryContract.getOwnCollections();
  };

  getNftCollection = async (collectionAddress) => {
    console.log(`🧹 getting NFT collection detail from ${collectionAddress}.`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const nftContract = new ethers.Contract(
      collectionAddress,
      nftContractABI.abi,
      provider
    );

    const royaltyFee = await nftContract.getRoyalty();

    return NftColletion.parse({
      address: collectionAddress,
      owner: await nftContract.owner(),
      name: await nftContract.name(),
      symbol: await nftContract.symbol(),
      royalty: BigInt(royaltyFee).toString(),
      royaltyRecipient: await nftContract.getRoyaltyRecipient(),
      totalSupply: await nftContract.totalSupply(),
    });
  };

  getOwnedNftCounts = async (ownerAddress, collectionAddress) => {
    console.log(
      `🧹 getting NFTs own by ${ownerAddress} in collection (${collectionAddress}).`
    );
    const provider = new ethers.BrowserProvider(window.ethereum);
    let nftsCount = 0;
    try {
      const nftContract = new ethers.Contract(
        collectionAddress,
        nftContractABI.abi,
        provider
      );

      const balance = await nftContract.balanceOf(ownerAddress);
      nftsCount = Number(balance);

      console.log(
        `📦 Total NFTs owned in collection (${collectionAddress}): ${balance.toString()}`
      );
    } catch (error) {
      console.log(
        `⚠️ There's an issue with this collection address (${collectionAddress}): ${error.message}`
      );
    }
    return nftsCount;
  };

  getOwnedNft = async (ownerAddress, collectionAddress, index) => {
    `🧹 getting token #${index} from ${collectionAddress}.`;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const nftContract = new ethers.Contract(
      collectionAddress,
      nftContractABI.abi,
      provider
    );
    let tokenId = -1;

    if (ownerAddress) {
      tokenId = await nftContract.tokenOfOwnerByIndex(ownerAddress, index);
    } else {
      tokenId = await nftContract.tokenByIndex(index);
      ownerAddress = await nftContract.ownerOf(tokenId);
    }

    return Nft.parse({
      owner: ownerAddress,
      collection: collectionAddress,
      collectionOwner: await nftContract.getRoyaltyRecipient(),
      collectionName: await nftContract.name(),
      tokenId: tokenId,
      tokenHash: await nftContract.tokenURI(tokenId),
      royalty: await nftContract.getRoyalty(),
    });
  };

  getListedNft = async (collectionAddress, index) => {
    `🧹 getting token #${index} from ${collectionAddress}.`;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      provider
    );

    const nftContract = new ethers.Contract(
      collectionAddress,
      nftContractABI.abi,
      provider
    );

    const tokenId = await nftContract.tokenOfOwnerByIndex(
      this.marketContractAddress,
      index
    );

    const marketItem = await marketContract.getListedNFT(
      collectionAddress,
      tokenId
    );

    return Nft.parse({
      seller: marketItem.seller,
      collection: collectionAddress,
      collectionOwner: await nftContract.getRoyaltyRecipient(),
      collectionName: await nftContract.name(),
      tokenId: tokenId,
      tokenHash: await nftContract.tokenURI(tokenId),
      royalty: await nftContract.getRoyalty(),
      price: ethers.formatUnits(marketItem.price.toString(), "ether"),
    });
  };

  getCollectionNftCounts = async (collectionAddress) => {
    console.log(
      `🧹 getting total NFTs count in collection (${collectionAddress}).`
    );
    const provider = new ethers.BrowserProvider(window.ethereum);
    let nftsCount = 0;
    try {
      const nftContract = new ethers.Contract(
        collectionAddress,
        nftContractABI.abi,
        provider
      );
      const totalSupply = await nftContract.totalSupply();
      nftsCount = Number(totalSupply);

      console.log(
        `📦 Total NFTs count in collection (${collectionAddress}): ${totalSupply.toString()}`
      );
    } catch (error) {
      console.log(
        `⚠️ There's an issue with this collection address (${collectionAddress}): ${error.message}`
      );
    }
    return nftsCount;
  };

  getTokenHash = async (collectionAddress, index) => {
    `🧹 getting token hash from ${collectionAddress}.`;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const nftContract = new ethers.Contract(
      collectionAddress,
      nftContractABI.abi,
      provider
    );
    const tokenId = await nftContract.tokenByIndex(index);
    return await nftContract.tokenURI(tokenId);
  };

  // #region admin
  getOwner = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      provider
    );
    return await marketContract.owner();
  };

  getPlatformFee = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      provider
    );
    const fee = await marketContract.getPlatformFee();
    return ethers.formatUnits(fee.toString(), "ether");
  };

  getPlatformFeeRecipient = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      provider
    );
    return await marketContract.getFeeRecipient();
  };
  updatePlatformFee = async (newPlatformFee) => {
    console.log(`📝 Updating marketplace fee recipient:`);
    console.log(`------------------------------`);
    console.log(`💲 New Platform Fee: ${newPlatformFee}`);
    console.log(`------------------------------`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      signer
    );
    const newFee = ethers.parseUnits(newPlatformFee.toString(), "ether");

    console.log("🔨 Submiting new platform fee.");
    const updatingTxn = await marketContract.updatePlatformFee(newFee);

    console.log("⏳ Transaction sent.");
    const res = await updatingTxn.wait();
    console.log("✅ Platform fee successfully updated!");

    const txn = EthereumTransaction.parse(res);
    return txn.getTransactionDetails();
  };
  changeFeeRecipient = async (newFeeRecipient) => {
    console.log(`📝 Updating marketplace fee recipient:`);
    console.log(`------------------------------`);
    console.log(`🙎‍♂️ New Recipient: ${newFeeRecipient}`);
    console.log(`------------------------------`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const marketContract = new ethers.Contract(
      this.marketContractAddress,
      marketContractABI.abi,
      signer
    );

    console.log("🔨 Submiting new fee recipient.");
    const updatingTxn = await marketContract.changeFeeRecipient(
      newFeeRecipient
    );

    console.log("⏳ Transaction sent.");
    const res = await updatingTxn.wait();
    console.log("✅ Fee recipient successfully updated!");

    const txn = EthereumTransaction.parse(res);
    return txn.getTransactionDetails();
  };
  // #endregion admin
}
export default MetaMaskClient;
