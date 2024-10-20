import MetaMaskReponse from "@/models/metamask/metaMaskError";

class MetaMaskUtils {
  static polygonNetwork = {
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

  static connectWallet = async (setAlertFunc) => {
    await this.ensureMetaMaskIsInstalled(setAlertFunc);
    await this.ensureNetworkIsCorrect(setAlertFunc);

    try {
      console.log(`🧹 connecting to wallet.`);
      const res = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(`✨ wallet connected. Wallet Address:${res}`);
      return res[0];
    } catch (error) {
      setAlertFunc("error", error.message);
      MetaMaskReponse.parse(error);
    }
  };

  static ensureMetaMaskIsInstalled = async (setAlertFunc) => {
    if (!window.ethereum) {
      console.log(`⚠️ MetaMask is either not installed or not connected.`);
      setAlertFunc("error", "Must connect to MetaMask!");
    }
  };

  static ensureNetworkIsCorrect = async (setAlertFunc) => {
    try {
      console.log(`🧹 ensuring connected chain is correct.`);
      const walletChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (walletChainId != this.polygonNetwork.chainId) {
        await this.switchNetwork(setAlertFunc);
      }
    } catch (error) {
      setAlertFunc("error", error.message);
      MetaMaskReponse.parse(error);
    }
  };

  static switchNetwork = async (setAlertFunc) => {
    try {
      console.log(`🧹 switching chain to ${this.polygonNetwork.chainId}`);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: this.polygonNetwork.chainId }],
      });
    } catch (error) {
      setAlertFunc("error", error.message);
      var switchError = MetaMaskReponse.parse(error);
      if (switchError.isChainNotAddedError()) {
        await this.addChain();
      }
    }
  };

  static addChain = async (setAlertFunc) => {
    try {
      console.log(
        `🧹 adding chain ${this.polygonNetwork.chainName} ${this.polygonNetwork.chainId}`
      );
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [polygonNetwork],
      });
    } catch (error) {
      setAlertFunc("error", error.message);
      MetaMaskReponse.parse(error);
    }
  };
}

export default MetaMaskUtils;
