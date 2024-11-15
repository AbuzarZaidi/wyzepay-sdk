import wally from "wallycore";

class VOut {
  private value: bigint;
  private assetId: Uint8Array;
  private assetGenerator: Uint8Array;
  private scriptPubKey: Uint8Array;
  private n: number;
  private abf: Uint8Array;
  private vbf: Uint8Array;
  private txId: Uint8Array;
  private assetIdHex: string | null = null;

  constructor(
    value: bigint,
    assetId: Uint8Array,
    assetGenerator: Uint8Array,
    scriptPubKey: Uint8Array,
    n: number,
    abf: Uint8Array,
    vbf: Uint8Array,
    parentTx: Uint8Array
  ) {
    this.value = value;
    this.assetId = assetId;
    this.assetGenerator = assetGenerator;
    this.scriptPubKey = scriptPubKey;
    this.n = n;
    this.abf = abf;
    this.vbf = vbf;
    this.txId = parentTx;
  }

  static async create(
    value: bigint,
    assetId: Uint8Array,
    assetGenerator: Uint8Array,
    scriptPubKey: Uint8Array,
    n: number,
    abf: Uint8Array,
    vbf: Uint8Array,
    parentTx: any // Replace with a proper type if parentTx is structured
  ): Promise<VOut> {
    const wally = await import("wallycore");
    const txId = wally.sha256d(wally.tx_to_bytes(parentTx, 0));
    return new VOut(value, assetId, assetGenerator, scriptPubKey, n, abf, vbf, txId);
  }

  static concatVoutArrays(arr1: VOut[], arr2: VOut[]): VOut[] {
    return [...arr1, ...arr2];
  }

  getValue(): bigint {
    return this.value;
  }

  getAssetId(): Uint8Array {
    return this.assetId;
  }

  async getAssetIdHex(): Promise<string> {
    const wally = await import("wallycore");
    if (!this.assetIdHex) {
      this.assetIdHex = wally.hex_from_bytes(this.flipBytes(this.assetId));
    }
    return this.assetIdHex;
  }

  getAssetGenerator(): Uint8Array {
    return this.assetGenerator;
  }

  getScriptPubKey(): Uint8Array {
    return this.scriptPubKey;
  }

  getN(): number {
    return this.n;
  }

  getAbf(): Uint8Array {
    return this.abf;
  }

  getVbf(): Uint8Array {
    return this.vbf;
  }

  getTxId(): Uint8Array {
    return this.txId;
  }

  private flipBytes(bytes: Uint8Array): Uint8Array {
    return Uint8Array.from(bytes).reverse();
  }
}

export default VOut;
