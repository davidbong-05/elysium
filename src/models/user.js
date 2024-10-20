class User {
  constructor({
    username,
    address,
    role = "unverified-user",
    email,
    profile_url = null,
    background_url = null,
    description = null,
    owned_nfts_count = 0,
    following = [],
    followings_count = 0,
    followers_count = 0,
    cart_content = [],
    session_id = null,
    verifiedAt = null,
  }) {
    this.username = username;
    this.address = address;
    if (address != null) {
      var truncated_address1 = address?.substring(0, 5);
      var truncated_address2 = address?.substring(
        address.length - 4,
        address.length
      );
      this.truncated_address = truncated_address1 + "..." + truncated_address2;
    }
    this.role = role;
    this.email = email;
    this.profile_url = profile_url;
    this.background_url = background_url;
    this.description = description;
    this.owned_nfts_count = owned_nfts_count;
    this.following = following;
    this.followings_count = followings_count;
    this.followers_count = followers_count;
    this.cart_content = cart_content;
    this.session_id = session_id;
    this.verifiedAt = verifiedAt;
    this.isVerified = this.verifiedAt != null;
  }

  static fromJson(jsonData) {
    try {
      const data =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      return new User({
        username: data.username,
        address: data.address,
        role: data.role || "unverified-user",
        email: data.email,
        profile_url: data.profile_url || null,
        background_url: data.background_url || null,
        description: data.description || null,
        followers_count: data.owned_nfts_count || 0,
        following: Array.isArray(data.following) ? data.following : [],
        followings_count: Array.isArray(data.following)
          ? data.following.length
          : 0,
        followers_count: data.followers_count || 0,
        cart_content: Array.isArray(data.cart_content) ? data.cart_content : [],
        session_id: data.session_id || null,
        verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null,
      });
    } catch (error) {
      console.error("Failed to parse User data:", error);
      return null;
    }
  }

  setOwnedNftCount(count) {
    this.owned_nfts_count = count || 0;
    console.log(`${this.username} owned ${count} NFTs.`);
  }

  updateUser(username, description) {
    var oldUsername = this.username;
    var oldDescription = this.description;
    this.username = username;
    this.description = description;
    console.log(`✨ updated username from ${oldUsername} to ${this.username}.`);
    console.log(
      `✨ updated description from ${oldDescription} t0 ${this.description}.`
    );
  }

  isOwner(address) {
    return this.address === address;
  }


  displayInfo() {
    console.log(`✨ User: ${this.username}, Role: ${this.role}.`);
    console.log(
      `✨ Followers: ${this.followers_count}, Following: ${this.following.length}`
    );
    if (this.isVerified) {
      console.log(`✨ Verified at: ${this.verifiedAt}.`);
    } else {
      console.log(`😢 Not yet verified.`);
    }
  }
}

export default User;
