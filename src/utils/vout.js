class VOut {
  constructor(
    value,
    assetId,
    assetGenerator,
    scriptPubKey,
    n,
    abf,
    vbf,
    parentTx
  ) {
    this.value = value;
    this.assetId = assetId;
    this.assetGenerator = assetGenerator;
    this.scriptPubKey = scriptPubKey;
    this.n = n;
    this.abf = abf;
    this.vbf = vbf;
    this.assetIdHex = null;
    this.txId = parentTx;
  }
  static async create(
    value,
    assetId,
    assetGenerator,
    scriptPubKey,
    n,
    abf,
    vbf,
    parentTx
  ) {
    const wally = await import("wallycore");
    const txId = wally.sha256d(wally.tx_to_bytes(parentTx, 0));

    return new VOut(
      value,
      assetId,
      assetGenerator,
      scriptPubKey,
      n,
      abf,
      vbf,
      txId
    );
  }
  static concatVoutArrays(arr1, arr2) {
    return [...arr1, ...arr2];
  }

  getValue() {
    return this.value;
  }

  getAssetId() {
    return this.assetId;
  }

  async getAssetIdHex() {
    const wally = await import("wallycore");
    if (!this.assetIdHex) {
      this.assetIdHex = wally.hex_from_bytes(this.flipBytes(this.assetId));
    }
    return this.assetIdHex;
  }

  getAssetGenerator() {
    return this.assetGenerator;
  }

  getScriptPubKey() {
    return this.scriptPubKey;
  }

  getN() {
    return this.n;
  }

  getAbf() {
    return this.abf;
  }

  getVbf() {
    return this.vbf;
  }

  getTxId() {
    return this.txId;
  }
  flipBytes(bytes) {
    return Buffer.from(bytes).reverse();
  }
}

export default VOut;
