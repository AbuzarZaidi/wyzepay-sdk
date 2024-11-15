import * as wally from "wallycore";
import ByteArrayHelpers from "./byteArrayHelpers";

class UnBlindedTx {
  constructor(vins, vouts, sourceTx) {
    this.vins = vins;
    this.vouts = vouts;
    this.sourceTx = sourceTx;

    this.abfs = [];
    this.vbfs = [];
    this.assetIds = [];
    this.assetGenerators = [];
    this.voutMap = new Map();
    this.initializeVouts();
    this.computeTransactionId();
  }
  initializeVouts() {
    this.vouts.forEach((vout) => {
      this.voutMap.set(vout.getN(), vout);
      this.abfs = ByteArrayHelpers.concatByteArrays(this.abfs, vout.getAbf());
      this.vbfs = ByteArrayHelpers.concatByteArrays(this.vbfs, vout.getVbf());
      this.assetIds = ByteArrayHelpers.concatByteArrays(
        this.assetIds,
        vout.getAssetId()
      );
      this.assetGenerators = ByteArrayHelpers.concatByteArrays(
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
      this.idHex = wally.hex_from_bytes(ByteArrayHelpers.flipBytes(this.id));
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
}

export default UnBlindedTx;
