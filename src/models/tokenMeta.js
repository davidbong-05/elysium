class TokenMeta {
  constructor({ hash, name, description, imageHash }) {
    this.hash = hash;
    this.name = name;
    this.description = description;
    this.imageHash = imageHash;
  }

  displayInfo() {
    console.log(`📦 TokenMeta:`);
    console.log(`------------------------------`);
    console.log(`🧾 Token Name: ${this.name}`);
    console.log(`#️⃣ Token Hash: ${this.hash}`);
    console.log(`📝 Description: ${this.description}`);
    console.log(`🖼️ Image Hash: ${this.imageHash}`);
    console.log(`------------------------------`);
  }

  static parse(jsonData) {
    const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    return new TokenMeta({
      name: data.name || null,
      description: data.description || null,
      imageHash: data.image || null,
    });
  }

  setTokenHash(hash) {
    this.hash = hash;
  }
}

export default TokenMeta;
