import wally from "wallycore";

class VIn {
  constructor(txId, voutN) {
    this.txId = txId;
    this.voutN = voutN;
    this.txIdHex = null;
  }
  getTxId() {
    return this.txId;
  }

  getVoutN() {
    return this.voutN;
  }

  async getTxIdHex() {
    const wally = await import("wallycore");
    if (!this.txIdHex) {
      this.txIdHex = wally.hex_from_bytes(this.flipBytes(this.txId));
    }
    return this.txIdHex;
  }
  flipBytes(bytes) {
    return Buffer.from(bytes).reverse();
  }
}

module.exports = VIn;
