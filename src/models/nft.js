class Nft {
  constructor({
    owner,
    ownerName,
    seller,
    sellerName,
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
    price,
  }) {
    this.owner = owner;
    this.ownerName = ownerName;
    this.seller = seller;
    this.sellerName = sellerName;
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
    this.price = price;
  }

  displayInfo() {
    console.log(`📦 NFT:`);
    console.log(`------------------------------`);
    if (!this.seller) {
      console.log(`👤 Owner: ${this.owner} (${this.ownerName})`);
    } else {
      console.log(`👨‍💼 Seller: ${this.seller} (${this.sellerName})`);
    }
    console.log(`🏛️ Collection: ${this.collection} (${this.collectionName})`);
    console.log(
      `👑 Collection Owner: ${this.collectionOwner} (${this.collectionOwnerName})`
    );
    console.log(`🆔 Token ID: ${this.tokenId}`);
    console.log(`🧾 Token Name: ${this.tokenName}`);
    console.log(`#️⃣ Token Hash: ${this.tokenHash}`);
    console.log(`📝 Description: ${this.tokenDescription}`);
    console.log(`💰 Royalty: ${this.royalty}%`);
    console.log(`🏷️ Price: ${this.price}`);
    console.log(`------------------------------`);
  }

  static parse(jsonData) {
    const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    return new Nft({
      owner: data.owner || null,
      ownerName: data.ownerName || null,
      seller: data.seller || null,
      sellerName: data.sellerName || null,
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
      price: data.price || "NOT FOR SALE",
    });
  }
}

export default Nft;
