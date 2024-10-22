class Nft {
  constructor({
    owner,
    ownerName,
    collection,
    collectionName,
    collectionOwner,
    collectionOwnerName,
    tokenId,
    tokenHash,
    tokenUri,
    tokenName,
    tokenDescription,
    royalty,
  }) {
    this.owner = owner;
    this.ownerName = ownerName;
    this.collection = collection;
    this.collectionName = collectionName;
    this.collectionOwner = collectionOwner;
    this.collectionOwnerName = collectionOwnerName;
    this.tokenId = tokenId;
    this.tokenHash = tokenHash;
    this.tokenUri = tokenUri;
    this.tokenName = tokenName;
    this.tokenDescription = tokenDescription;
    this.royalty = royalty;
    this.displayInfo();
  }

  displayInfo() {
    console.log(`📦 NFT:`);
    console.log(`------------------------------`);
    console.log(`👤 Owner: ${this.owner}`);
    console.log(`🏛️ Collection: ${this.collection} (${this.collectionName})`);
    console.log(`👑 Collection Owner: ${this.collectionOwner}`);
    console.log(`🆔 Token ID: ${this.tokenId}`);
    console.log(`#️⃣ Token Hash: ${this.tokenHash}`);
    console.log(`📝 Description: ${this.tokenDescription}`);
    console.log(`💰 Royalty: ${this.royalty}%`);
    console.log(`------------------------------`);
  }

  static parse(jsonData) {
    const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    return new Nft({
      owner: data.owner,
      ownerName: data.ownerName || null,
      collection: data.collection,
      collectionName: data.collectionName || null,
      collectionOwner: data.collectionOwner || null,
      collectionOwnerName: data.collectionOwnerName || null,
      tokenId: data.tokenId,
      tokenHash: data.tokenHash || null,
      tokenUri:
        data.tokenUri ||
        "https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled-1150x647.png",
      tokenName: data.tokenName || null,
      tokenDescription: data.tokenDescription || null,
      royalty: data.royalty,
    });
  }

  setUri(tokenUri) {
    this.tokenUri = tokenUri;
  }

  setTokenName(tokenName) {
    this.tokenName = tokenName;
  }

  setTokenDescription(tokenDescription) {
    this.tokenDescription = tokenDescription;
  }
}

export default Nft;
