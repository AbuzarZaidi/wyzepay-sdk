import wally from "wallycore";
import ParentAccount from "./parentAccount";
import VIn from "./vin";
import VOut from "./vout";
import ByteArrayHelpers from "./byteArrayHelpers";
class ChildAccount {
  constructor(
    mnemonic,
    masterKey,
    seed,
    childNo,
    derivedKey,
    address,
    confidentialAddress,
    masterBlindingKeyHex,
    scriptPubKey,
    scriptPubKeyHex,
    publicBlindingKey,
    privateBlindingKey,
    privateBlindingKeyHex,
    publicBlindingKeyHex,
    privkeyHex,
    pubkeyHex
  ) {
    this.mnemonic = mnemonic;
    this.masterKey = masterKey;
    this.seed = seed;
    this.childNo = childNo;
    this.derivedKey = derivedKey;
    this.address = address;
    this.confidentialAddress = confidentialAddress;
    this.masterBlindingKeyHex = masterBlindingKeyHex;
    this.scriptPubKey = scriptPubKey;
    this.scriptPubKeyHex = scriptPubKeyHex;
    this.publicBlindingKey = publicBlindingKey;
    this.privateBlindingKey = privateBlindingKey;
    this.privateBlindingKeyHex = privateBlindingKeyHex;
    this.publicBlindingKeyHex = publicBlindingKeyHex;
    this.privkeyHex = privkeyHex;
    this.pubkeyHex = pubkeyHex;
  }
  static async create(mnemonic, masterKey, seed, childNo) {
    const wally = await import("wallycore");
    const derivedKey = wally.bip32_key_from_parent(
      masterKey,
      childNo,
      wally.BIP32_FLAG_KEY_PRIVATE
    );
    const address = wally.bip32_key_to_address(
      derivedKey,
      wally.WALLY_ADDRESS_TYPE_P2PKH,
      wally.WALLY_ADDRESS_VERSION_P2PKH_LIQUID_REGTEST
    );
    const masterBlindingKey = wally.asset_blinding_key_from_seed(seed);
    const masterBlindingKeyHex = wally.hex_from_bytes(masterBlindingKey);
    let scriptPubKey = Buffer.alloc(wally.WALLY_SCRIPTPUBKEY_P2PKH_LEN);
    scriptPubKey = wally.address_to_scriptpubkey(
      address,
      wally.WALLY_NETWORK_LIQUID_REGTEST
    );
    const scriptPubKeyHex = wally.hex_from_bytes(scriptPubKey);
    const privateBlindingKey = wally.asset_blinding_key_to_ec_private_key(
      masterBlindingKey,
      scriptPubKey
    );
    const privateBlindingKeyHex = wally.hex_from_bytes(privateBlindingKey);
    const publicBlindingKey =
      wally.ec_public_key_from_private_key(privateBlindingKey);
    const publicBlindingKeyHex = wally.hex_from_bytes(publicBlindingKey);
    const confidentialAddress = wally.confidential_addr_from_addr(
      address,
      wally.WALLY_CA_PREFIX_LIQUID_REGTEST,
      publicBlindingKey
    );
    const privkey = wally.bip32_key_get_priv_key(derivedKey);
    const privkeyHex = wally.hex_from_bytes(privkey);
    const pubkey = wally.ec_public_key_from_private_key(privkey);
    const pubkeyHex = wally.hex_from_bytes(pubkey);
    return new ChildAccount(
      mnemonic,
      masterKey,
      seed,
      childNo,
      derivedKey,
      address,
      confidentialAddress,
      masterBlindingKeyHex,
      scriptPubKey,
      scriptPubKeyHex,
      publicBlindingKey,
      privateBlindingKey,
      privateBlindingKeyHex,
      publicBlindingKeyHex,
      privkeyHex,
      pubkeyHex
    );
  }
  getMasterBlindingKeyHex() {
    return this.masterBlindingKeyHex;
  }

  getScriptPubKeyHex() {
    return this.scriptPubKeyHex;
  }

  getPrivateBlindingKeyHex() {
    return this.privateBlindingKeyHex;
  }

  getPublicBlindingKeyHex() {
    return this.publicBlindingKeyHex;
  }

  getPrivkeyHex() {
    return this.privkeyHex;
  }

  getPubkeyHex() {
    return this.pubkeyHex;
  }

  async unBlindTxHex(txHex) {
    const wally = await import("wallycore");
    const tx = wally.tx_from_hex(
      txHex,
      wally.WALLY_TX_FLAG_USE_ELEMENTS | wally.WALLY_TX_FLAG_USE_WITNESS
    );
    return this.unBlindTx(tx);
  }
  async unBlindTx(tx) {
    try {
      const Wally = await import("wallycore");
      const UnBlindedTx = await import("./UnBlindedTx").then(
        (module) => module.default
      );
      const numInputs = await Wally.tx_get_num_inputs(tx);
      const vins = [];

      for (let i = 0; i < numInputs; i++) {
        const voutN = await Wally.tx_get_input_index(tx, i);
        const txId = await Wally.tx_get_input_txhash(tx, i);
        vins.push(new VIn(txId, voutN));
      }
      const numOutputs = await Wally.tx_get_num_outputs(tx);
      const vouts = [];
      let voutsInSize = 0;
      for (let vout = 0; vout < numOutputs; vout++) {
        const scriptPubkeyOut = Wally.tx_get_output_script(tx, vout);
        if (
          !Buffer.from(scriptPubkeyOut).equals(Buffer.from(this.scriptPubKey))
        ) {
          continue;
        }
        const senderEphemeralPubkey = Wally.tx_get_output_nonce(tx, vout);
        const rangeproof = Wally.tx_get_output_rangeproof(tx, vout);
        const assetId = Wally.tx_get_output_asset(tx, vout);
        const valueCommitment = Wally.tx_get_output_value(tx, vout);
        const outputs = Wally.asset_unblind(
          senderEphemeralPubkey,
          this.privateBlindingKey,
          rangeproof,
          valueCommitment,
          scriptPubkeyOut,
          assetId
        );
        const assetIdOut = outputs[0];
        const abfOut = outputs[1];
        const vbfOut = outputs[2];
        const assetGenerator = Wally.asset_generator_from_bytes(
          assetIdOut,
          abfOut
        );
        vouts[voutsInSize] = await VOut.create(
          outputs,
          assetIdOut,
          assetGenerator,
          scriptPubkeyOut,
          vout,
          abfOut,
          vbfOut,
          tx
        );
        voutsInSize++;
      }
      return new UnBlindedTx(vins, vouts.slice(0, voutsInSize), tx);
    } catch (error) {
      console.error("Error in unblinding transaction:", error);
      throw error;
    }
  }
  getDerivedKey() {
    return this.derivedKey;
  }

  getAddress() {
    return this.address;
  }

  getMasterBlindingKey() {
    return this.masterBlindingKey;
  }

  getScriptPubKey() {
    return this.scriptPubKey;
  }

  getPrivateBlindingKey() {
    return this.privateBlindingKey;
  }

  getPublicBlindingKey() {
    return this.publicBlindingKey;
  }

  getConfidentialAddress() {
    return this.confidentialAddress;
  }

  getPrivkey() {
    return this.privkey;
  }

  getPubkey() {
    return this.pubkey;
  }
}

module.exports = ChildAccount;
