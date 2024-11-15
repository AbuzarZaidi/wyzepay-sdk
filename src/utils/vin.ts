import wally from "wallycore";

class VIn {
  private txId: Uint8Array; // Assuming txId is a Uint8Array
  private voutN: number;
  private txIdHex: string | null = null;

  constructor(txId: Uint8Array, voutN: number) {
    this.txId = txId;
    this.voutN = voutN;
  }

  getTxId(): Uint8Array {
    return this.txId;
  }

  getVoutN(): number {
    return this.voutN;
  }

  async getTxIdHex(): Promise<string> {
    if (!this.txIdHex) {
      const wally = await import("wallycore");
      this.txIdHex = wally.hex_from_bytes(this.flipBytes(this.txId));
    }
    return this.txIdHex;
  }

  private flipBytes(bytes: Uint8Array): Uint8Array {
    return Uint8Array.from(bytes).reverse();
  }
}

export default VIn;
