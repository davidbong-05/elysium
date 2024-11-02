class NftColletion {
  constructor({
    address,
    cover,
    owner,
    name,
    symbol,
    royalty,
    royaltyRecipient,
    royaltyRecipientName,
    totalSupply,
    follower,
    link,
  }) {
    this.address = address;
    this.cover = cover;
    this.owner = owner;
    this.name = name;
    this.symbol = symbol;
    this.royalty = royalty;
    this.royaltyRecipient = royaltyRecipient;
    this.royaltyRecipientName = royaltyRecipientName;
    this.totalSupply = totalSupply;
    this.follower = follower;
    this.link = link;
    this.displayInfo();
  }

  // Method to display formatted collection info
  displayInfo() {
    console.log(`🎨 NFT Collection:`);
    console.log(`------------------------------`);
    console.log(`🏛️ Collection Address:     ${this.address}`);
    console.log(`👑 Owner:                  ${this.owner}`);
    console.log(`🧾 Name:                   ${this.name}`);
    console.log(`💠 Symbol:                 ${this.symbol}`);
    console.log(`💸 Royalty Fee:            ${this.royalty}%`);
    console.log(`🎁 Royalty Recipient:      ${this.royaltyRecipient}`);
    console.log(`📦 Total Supply:           ${this.totalSupply}`);
    console.log(`------------------------------`);
  }

  static parse(jsonData) {
    const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    return new NftColletion({
      address: data.address,
      cover:
        data.cover ||
        "https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled-1150x647.png",
      owner: data.owner,
      name: data.name,
      symbol: data.symbol,
      royalty: data.royalty,
      royaltyRecipient: data.royaltyRecipient,
      royaltyRecipientName: data.royaltyRecipientName || null,
      totalSupply: data.totalSupply || 0,
      link: `/collection/${data.address}`,
    });
  }

  setCover(imageUrl) {
    this.cover = imageUrl;
  }

  setRoyaltyRecipientName(royaltyRecipientName) {
    this.royaltyRecipientName = royaltyRecipientName;
  }
}

export default NftColletion;
