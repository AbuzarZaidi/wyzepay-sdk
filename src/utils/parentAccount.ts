import ChildAccount from "./childAccount";
import { mnemonicToSeed } from "bip39";
import crypto from "crypto";

// Defining types for better clarity and type safety
type MasterKey = any;  // Replace 'any' with the appropriate type from wallycore
type Seed = Uint8Array;

class ParentAccount {
  mnemonic: string;
  masterKey: MasterKey | null;
  seed: Seed | null;

  constructor(mnemonic: string, masterKey: MasterKey | null = null, seed: Seed | null = null) {
    this.mnemonic = mnemonic;
    this.masterKey = masterKey;
    this.seed = seed;
  }
  
  // Create a new ParentAccount from a mnemonic
  static async create(mnemonic: string): Promise<ParentAccount> {
    const wally = await import("wallycore");
    const seed = await mnemonicToSeed(mnemonic);
    const masterKey = wally.bip32_key_from_seed(
        new Uint8Array(seed),
        wally.BIP32_VER_MAIN_PRIVATE,// Type assertion
        0
      );
      

    return new ParentAccount(mnemonic, masterKey, seed);
  }

  // Derive a child account from the ParentAccount
  async deriveAccount(childNo: number): Promise<ChildAccount> {
    const childAccount = await ChildAccount.create(
      this.mnemonic,
      this.masterKey,
      this.seed,
      childNo
    );
    return childAccount;
  }

  getMnemonic(): string {
    return this.mnemonic;
  }

  getMasterKey(): MasterKey | null {
    return this.masterKey;
  }

  getSeed(): Seed | null {
    return this.seed;
  }

  // Generate random bytes of a given length
  static randomBytes(byteLen: number): Buffer {
    return crypto.randomBytes(byteLen);
  }

  // Generate an ephemeral key (32 random bytes)
  static generateEphemeralKey(): Buffer {
    return ParentAccount.randomBytes(32);
  }
}

export default ParentAccount;
