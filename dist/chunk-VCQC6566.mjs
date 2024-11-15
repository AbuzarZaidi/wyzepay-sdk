// src/utils/unblindedTx.ts
import * as wally from "wallycore";

// src/utils/byteArrayHelpers.ts
var ByteArrayHelpers = class {
  /**
   * Concatenate two byte arrays.
   * @param arr1 - The first byte array.
   * @param arr2 - The second byte array.
   * @returns A new concatenated Uint8Array.
   */
  static concatByteArrays(arr1, arr2) {
    const combined = new Uint8Array(arr1.length + arr2.length);
    combined.set(arr1, 0);
    combined.set(arr2, arr1.length);
    return combined;
  }
  /**
   * Trim trailing zeros from a byte array.
   * @param data - The input byte array.
   * @returns A new Uint8Array without trailing zeros.
   */
  static trimTrailingZeros(data) {
    let i = data.length - 1;
    while (i >= 0 && data[i] === 0) {
      i--;
    }
    return data.slice(0, i + 1);
  }
  /**
   * Flip the bytes of a byte array (reverse order).
   * @param original - The original byte array.
   * @returns A new Uint8Array with reversed byte order.
   */
  static flipBytes(original) {
    return original.slice().reverse();
  }
  /**
   * Check if two byte arrays are equal.
   * @param arr1 - The first byte array.
   * @param arr2 - The second byte array.
   * @returns True if the arrays are equal, otherwise false.
   */
  static arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
};
var byteArrayHelpers_default = ByteArrayHelpers;

// src/utils/unblindedTx.ts
var UnBlindedTx = class {
  vins;
  // Replace `any` with a specific type if available
  vouts;
  sourceTx;
  // Replace `any` with the specific transaction type
  abfs = new Uint8Array();
  vbfs = new Uint8Array();
  assetIds = new Uint8Array();
  assetGenerators = new Uint8Array();
  voutMap = /* @__PURE__ */ new Map();
  id;
  idHex;
  constructor(vins, vouts, sourceTx) {
    this.vins = vins;
    this.vouts = vouts;
    this.sourceTx = sourceTx;
    this.initializeVouts();
    this.computeTransactionId();
  }
  initializeVouts() {
    this.vouts.forEach((vout) => {
      this.voutMap.set(vout.getN(), vout);
      this.abfs = byteArrayHelpers_default.concatByteArrays(this.abfs, vout.getAbf());
      this.vbfs = byteArrayHelpers_default.concatByteArrays(this.vbfs, vout.getVbf());
      this.assetIds = byteArrayHelpers_default.concatByteArrays(
        this.assetIds,
        vout.getAssetId()
      );
      this.assetGenerators = byteArrayHelpers_default.concatByteArrays(
        this.assetGenerators,
        vout.getAssetGenerator()
      );
    });
  }
  computeTransactionId() {
    try {
      const txBytes = wally.tx_to_bytes(this.sourceTx, 0);
      this.id = wally.sha256d(txBytes);
    } catch (error) {
      console.error(error, "error");
      throw new Error(
        "TransactionDecodeException: Could not convert transaction to bytes"
      );
    }
  }
  getIdHex() {
    if (!this.idHex) {
      if (!this.id) {
        throw new Error("Transaction ID not computed");
      }
      this.idHex = wally.hex_from_bytes(byteArrayHelpers_default.flipBytes(this.id));
    }
    return this.idHex;
  }
  getVins() {
    return this.vins;
  }
  getVinsCount() {
    return this.vins.length;
  }
  getVouts() {
    return this.vouts;
  }
  getVoutCount() {
    return this.vouts.length;
  }
  getVout(n) {
    return this.voutMap.get(n);
  }
  getAbfs() {
    return this.abfs;
  }
  getVbfs() {
    return this.vbfs;
  }
  getAssetIds() {
    return this.assetIds;
  }
  getAssetGenerators() {
    return this.assetGenerators;
  }
  getId() {
    return this.id;
  }
  getSourceTx() {
    return this.sourceTx;
  }
};
var unblindedTx_default = UnBlindedTx;

export {
  unblindedTx_default
};
