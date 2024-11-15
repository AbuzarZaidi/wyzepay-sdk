import * as wally from "wallycore";
import ByteArrayHelpers from "./byteArrayHelpers";

interface VOut {
  getN(): number;
  getAbf(): Uint8Array;
  getVbf(): Uint8Array;
  getAssetId(): Uint8Array;
  getAssetGenerator(): Uint8Array;
}

class UnBlindedTx {
  private vins: any[]; // Replace `any` with a specific type if available
  private vouts: VOut[];
  private sourceTx: any; // Replace `any` with the specific transaction type
  private abfs: Uint8Array = new Uint8Array();
  private vbfs: Uint8Array = new Uint8Array();
  private assetIds: Uint8Array = new Uint8Array();
  private assetGenerators: Uint8Array = new Uint8Array();
  private voutMap: Map<number, VOut> = new Map();
  private id?: Uint8Array;
  private idHex?: string;

  constructor(vins: any[], vouts: VOut[], sourceTx: any) {
    this.vins = vins;
    this.vouts = vouts;
    this.sourceTx = sourceTx;

    this.initializeVouts();
    this.computeTransactionId();
  }

  private initializeVouts(): void {
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

  private computeTransactionId(): void {
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

  public getIdHex(): string {
    if (!this.idHex) {
      if (!this.id) {
        throw new Error("Transaction ID not computed");
      }
      this.idHex = wally.hex_from_bytes(ByteArrayHelpers.flipBytes(this.id));
    }
    return this.idHex;
  }

  public getVins(): any[] {
    return this.vins;
  }

  public getVinsCount(): number {
    return this.vins.length;
  }

  public getVouts(): VOut[] {
    return this.vouts;
  }

  public getVoutCount(): number {
    return this.vouts.length;
  }

  public getVout(n: number): VOut | undefined {
    return this.voutMap.get(n);
  }

  public getAbfs(): Uint8Array {
    return this.abfs;
  }

  public getVbfs(): Uint8Array {
    return this.vbfs;
  }

  public getAssetIds(): Uint8Array {
    return this.assetIds;
  }

  public getAssetGenerators(): Uint8Array {
    return this.assetGenerators;
  }

  public getId(): Uint8Array | undefined {
    return this.id;
  }

  public getSourceTx(): any {
    return this.sourceTx;
  }
}

export default UnBlindedTx;
