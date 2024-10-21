import factoryContractABI from "../artifacts/contractABI/ElysiumNFTFactory.json";
import { ethers } from "ethers";
import MetaMaskReponse from "@/models/metamask/metaMaskError";
import EthereumTransaction from "@/models/metamask/ethereumTransaction";

class MetaMaskClient {
  constructor(factoryContractAddress, setAlertFunc) {
    this.factoryContractAddress = factoryContractAddress;
    this.setAlertFunc = setAlertFunc;
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
      this.setAlertFunc("error", "Must connect to MetaMask!");
    }
  };

  ensureNetworkIsCorrect = async () => {
    console.log(`🧹 ensuring connected chain is correct.`);
    const walletChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    if (walletChainId != MetaMaskClient.POLYGON_NETWORK.chainId) {
      await this.switchNetwork(this.setAlertFunc);
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
    console.log(`⚒️  Creating a new collection:
------------------------------
📛 Name:               ${name}
💠 Symbol:             ${symbol}
💸 Royalty Fee:        ${royaltyFee}%
👑 Royalty Recipient:  ${royaltyRecipient}
------------------------------
🚀 Collection is being created...
    `);
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
}

export default MetaMaskClient;
