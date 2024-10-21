import MetaMaskReponse from "@/models/metamask/metaMaskError";

class MetaMaskClient {
  constructor({ setAlertFunc }) {
    this.setAlertFunc = setAlertFunc;
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

    try {
      console.log(`🧹 connecting to wallet.`);
      const res = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(`✨ wallet connected. Wallet Address:${res}`);
      return res[0];
    } catch (error) {
      this.setAlertFunc("error", error.message);
      MetaMaskReponse.parse(error);
    }
  };

  ensureMetaMaskIsInstalled = async () => {
    if (!window.ethereum) {
      console.log(`⚠️ MetaMask is either not installed or not connected.`);
      this.setAlertFunc("error", "Must connect to MetaMask!");
    }
  };

  ensureNetworkIsCorrect = async () => {
    try {
      console.log(`🧹 ensuring connected chain is correct.`);
      const walletChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (walletChainId != MetaMaskClient.POLYGON_NETWORK.chainId) {
        await this.switchNetwork(this.setAlertFunc);
      }
    } catch (error) {
      this.setAlertFunc("error", error.message);
      MetaMaskReponse.parse(error);
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
      this.setAlertFunc("error", error.message);
      var switchError = MetaMaskReponse.parse(error);
      if (switchError.isChainNotAddedError()) {
        await this.addChain();
      }
    }
  };

  addChain = async () => {
    try {
      console.log(
        `🧹 adding chain ${MetaMaskClient.POLYGON_NETWORK.chainName} ${MetaMaskClient.POLYGON_NETWORK.chainId}`
      );
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [POLYGON_NETWORK],
      });
    } catch (error) {
      this.setAlertFunc("error", error.message);
      MetaMaskReponse.parse(error);
    }
  };
}

export default MetaMaskClient;
