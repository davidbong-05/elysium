import { ethers } from "ethers";
import BaseTransaction from "./baseTransaction.js";

class EthereumTransaction extends BaseTransaction {
  constructor({
    blobGasPrice = null,
    blobGasUsed = null,
    blockHash,
    blockNumber,
    contractAddress = null,
    cumulativeGasUsed,
    from,
    gasPrice,
    gasUsed,
    hash,
    index,
    logsBloom,
    provider,
    root = undefined,
    status,
    to,
    type,
    fee,
  }) {
    super(status === 1);
    this.blobGasPrice = blobGasPrice;
    this.blobGasUsed = blobGasUsed;
    this.blockHash = blockHash;
    this.blockNumber = blockNumber;
    this.contractAddress = contractAddress;
    this.cumulativeGasUsed = cumulativeGasUsed;
    this.from = from;
    this.gasPrice = gasPrice;
    this.gasUsed = gasUsed;
    this.hash = hash;
    this.index = index;
    this.logsBloom = logsBloom;
    this.provider = provider;
    this.root = root;
    this.status = status;
    this.to = to;
    this.type = type;
    this.fee = fee;
    this.displayInfo();
  }

  displayInfo() {
    console.log(`🔍 Transaction Info:`);
    console.log(`-------------------------------`);
    console.log(`🧾 Transaction Hash: ${this.hash}`);
    console.log(`📦 Block Number: ${this.blockNumber}`);
    console.log(`🔗 Block Hash: ${this.blockHash}`);
    console.log(`👤 From: ${this.from}`);
    console.log(`👤 To: ${this.to}`);
    console.log(`⛽ Gas Used: ${this.gasUsed}`);
    console.log(`💰 Gas Price: ${this.gasPrice}`);
    console.log(`💸 Total Fee: ${this.fee}`);
    console.log(`📑 Contract Address: ${this.contractAddress}`);
    console.log(`✔️ Status: ${this.status === 1 ? "Success" : "Failed"}`);
    console.log(
      `📈 Transaction Type: ${this.type === 2 ? "EIP-1559 (Type 2)" : "Legacy"}`
    );
    console.log(`-------------------------------`);
  }

  static parse(jsonData) {
    const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    return new EthereumTransaction({
      blobGasPrice: data.blobGasPrice,
      blobGasUsed: data.blobGasUsed,
      blockHash: data.blockHash,
      blockNumber: data.blockNumber,
      contractAddress: data.contractAddress || "N/A",
      cumulativeGasUsed: BigInt(data.cumulativeGasUsed),
      from: data.from,
      gasPrice: BigInt(data.gasPrice),
      gasUsed: BigInt(data.gasUsed),
      hash: data.hash,
      index: data.index,
      logsBloom: data.logsBloom,
      provider: data.provider,
      root: data.root,
      status: data.status,
      to: data.to,
      type: data.type,
      fee: BigInt(data.fee),
    });
  }

  getTransactionDetails() {
    return {
      isSuccess: this.isSuccess,
      status: this.status === 1 ? "Success" : "Failed",
      from: this.from,
      to: this.to,
      blockNumber: this.blockNumber,
      hash: this.hash,
      gasUsed: this.gasUsed,
      gasPrice: ethers.formatUnits(this.gasPrice, "ether"),
      fee: ethers.formatUnits(this.fee, "ether"),
    };
  }
}

export default EthereumTransaction;
