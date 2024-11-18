import ChildAccount from "./childAccount.js";
import { mnemonicToSeed } from "bip39";
import crypto from "crypto";

class ParentAccount {
  constructor(mnemonic, masterKey = null, seed = null) {
    this.mnemonic = mnemonic;
    this.masterKey = masterKey;
    this.seed = seed;
  }

  static async create(mnemonic) {
    const wally = await import("wallycore");
    const seed = await mnemonicToSeed(mnemonic);
    const masterKey = wally.bip32_key_from_seed(
      new Uint8Array(seed),
      wally.BIP32_VER_TEST_PRIVATE,
      0
    );

    return new ParentAccount(mnemonic, masterKey, seed);
  }

  async deriveAccount(childNo) {
    const childAccount = await ChildAccount.create(
      this.mnemonic,
      this.masterKey,
      this.seed,
      childNo
    );
    return childAccount;
  }

  getMnemonic() {
    return this.mnemonic;
  }

  getMasterKey() {
    return this.masterKey;
  }

  getSeed() {
    return this.seed;
  }

  static randomBytes(byteLen) {
    return crypto.randomBytes(byteLen);
  }

  static generateEphemeralKey() {
    return ParentAccount.randomBytes(32);
  }
}
export default ParentAccount;
