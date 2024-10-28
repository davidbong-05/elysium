String.prototype.truncateAddress = function () {
  if (this?.length >= 9) {
    const truncatedAddressStart = this.substring(0, 5);
    const truncatedAddressEnd = this.substring(this.length - 4);
    return `${truncatedAddressStart}...${truncatedAddressEnd}`;
  }
  return this.toString();
};
