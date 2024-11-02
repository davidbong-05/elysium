String.prototype.truncateAddress = function () {
  if (this?.length >= 9) {
    const truncatedAddressStart = this.substring(0, 5);
    const truncatedAddressEnd = this.substring(this.length - 4);
    return `${truncatedAddressStart}...${truncatedAddressEnd}`;
  }
  return this.toString();
};

String.prototype.ignoreCaseEqual = function (str2) {
  return this.toLocaleLowerCase() === str2.toLocaleLowerCase();
};
