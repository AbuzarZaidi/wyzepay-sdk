import ParentAccount from "./parentAccount.js";
import ByteArrayHelpers from "./byteArrayHelpers.js";
import BigNumber from "bignumber.js";
import VIn from "./vin.js";
import VOut from "./vout.js";
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
  async signTransaction(tx, inputs) {
    const wally = await import("wallycore");
    let voutN = 0;

    // Add raw inputs to the transaction
    for (const vout of inputs) {
        wally.tx_add_elements_raw_input(
            tx,
            vout.getTxId(),
            vout.getN(),
            0xffffffff, // Sequence
            null,       // Script witness stack (null)
            null,       // Asset (null)
            null,       // Value (null)
            null,       // Value blinding (null)
            null,       // Asset blinding (null)
            null,       // Extra (null)
            null,       // Issuance amount (null)
            null,       // Inflation keys (null)
            null,       // Issuance blinding (null)
            0           // Flags
        );
    }

    // Sign each input
    for (const vout of inputs) {
        const sighash = new Uint8Array(wally.SHA256_LEN);

        // Get the BTC signature hash
        wally.tx_get_btc_signature_hash(
            tx,
            voutN,
            vout.getScriptPubKey(),
            0,
            Wally.WALLY_SIGHASH_ALL,
            0,
            sighash
        );

        // Generate the signature from the private key and hash
        const signature = wally.ec_sig_from_bytes(
            privkey, // Assumes `privkey` is defined and accessible
            sighash,
            wally.EC_FLAG_ECDSA
        );

        // Create the scriptsig
        let scriptsig = new Uint8Array(wally.WALLY_SCRIPTSIG_P2PKH_MAX_LEN);
        wally.scriptsig_p2pkh_from_sig(
            pubkey, // Assumes `pubkey` is defined and accessible
            signature,
            wally.WALLY_SIGHASH_ALL,
            scriptsig
        );

        // Remove trailing zeros from the scriptsig
        scriptsig = scriptsig.slice(0, scriptsig.findIndex((byte) => byte === 0));

        // Set the input script for the transaction
        wally.tx_set_input_script(tx, voutN, scriptsig);

        voutN++;
    }
}
calculateChange(vouts, amounts) {
  if (vouts.length !== amounts.length) {
      throw new Error("You must specify an amount to transfer for each vout, if you wish to not transfer a vout use 0");
  }

  let insertIndex = 0;
  const change = new Array(vouts.length);
  
  for (let i = 0; i < vouts.length; i++) {
      const outputChange = vouts[i].value - amounts[i];
      if (outputChange < 0) {
          throw new Error(`Amount to transfer greater than vout value for vout ${vouts[i].n}`);
      } else if (outputChange > 0) {
          // Only add non-zero change amounts
          change[insertIndex] = outputChange;
          insertIndex++;
      }
  }

  // Return array of valid changes (ignoring trailing 0s)
  return change.slice(0, insertIndex);
}
concatByteArrays(...arrays) {
  // Calculate the total length of the concatenated array
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);

  // Create a new Uint8Array with the total length
  const result = new Uint8Array(totalLength);

  // Copy each array into the result
  let offset = 0;
  for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
  }

  return result;
}
async  createBlindTx(inputs, destination, amountsToTransfer) {
  const wally = await import("wallycore");
  let concatAbfs = new Uint8Array(0);
  let concatVbfs = new Uint8Array(0);
  let concatAssetIds = new Uint8Array(0);
  let concatAssetGenerators = new Uint8Array(0);

  inputs.forEach((vout) => {
      concatAbfs = ByteArrayHelpers.concatByteArrays(concatAbfs, vout.abf);
      concatVbfs = ByteArrayHelpers.concatByteArrays(concatVbfs, vout.vbf);
      concatAssetIds = ByteArrayHelpers.concatByteArrays(concatAssetIds, vout.assetId);
      concatAssetGenerators = ByteArrayHelpers.concatByteArrays(concatAssetGenerators, vout.assetGenerator);
  });
  const values = [];
  inputs.forEach((vout, i) => {
    const filteredValues = vout.value.filter(item => typeof item === 'bigint');
    values[i] = filteredValues[0];
  });
  let outputOffset = 0;
  values.forEach((vout, i) => {
      values[i + outputOffset + inputs.length] = amountsToTransfer[i];
      
      // console.log(amountsToTransfer[i],'amountsToTransfer[i]')
      const outputChange = vout - amountsToTransfer[i];
      if (outputChange > 0) {
          values[i + outputOffset + inputs.length + 1] = outputChange;
          outputOffset++;
      }
  });
  const numOutputs = values.length - inputs.length;
  const abfsOut = ParentAccount.randomBytes(32 * numOutputs);
  let vbfsOut = ParentAccount.randomBytes(32 * (numOutputs - 1));
  const abfsAll = ByteArrayHelpers.concatByteArrays(concatAbfs, abfsOut);
  const vbfsAll = ByteArrayHelpers.concatByteArrays(concatVbfs, vbfsOut);
  const finalVbf = wally.asset_final_vbf(values, inputs.length, abfsAll, vbfsAll);
  vbfsOut =ByteArrayHelpers.concatByteArrays(vbfsOut,finalVbf)
  const outputTx = wally.tx_init(ParentAccount.TRANSACTION_VERSION_TO_USE, 0, 0, 0);
console.log(outputTx,'outputTx')
  let changeOffset = 0;

  for (let i = 0; i < inputs.length; i++) {
      const vout = inputs[i];
      const ephemeralPrivkey = ParentAccount.generateEphemeralKey();
      const ephemeralPubkey = wally.ec_public_key_from_private_key(ephemeralPrivkey);

      const changeEphemeralPrivkey = ParentAccount.generateEphemeralKey();
      const changeEphemeralPubkey = wally.ec_public_key_from_private_key(changeEphemeralPrivkey);

      const abf = abfsOut.slice(i * 32 + (changeOffset * 32), (i * 32) + (changeOffset * 32) + 32);
      const vbf = vbfsOut.slice(i * 32 + (changeOffset * 32), (i * 32) + (changeOffset * 32) + 32);

      const generator = wally.asset_generator_from_bytes(vout.assetId, abf);
      const valueCommitment = wally.asset_value_commitment(amountsToTransfer[i], vbf, generator);
 const min_val=new BigNumber(1)
      const rangeProof = wally.asset_rangeproof(
          amountsToTransfer[i],
          destination.blindingPubkey,
          ephemeralPrivkey,
          vout.assetId,
          abf,
          vbf,
          valueCommitment,
          destination.scriptPubkey,
          generator,
          min_val,
          0,
          36
      );

      const surjectionProof = wally.asset_surjectionproof(
          vout.assetId,
          abf,
          generator,
          ParentAccount.randomBytes(32),
          concatAssetIds,
          concatAbfs,
          concatAssetGenerators
      );

      wally.tx_add_elements_raw_output(
          outputTx,
          destination.scriptPubkey,
          generator,
          valueCommitment,
          ephemeralPubkey,
          surjectionProof,
          rangeProof,
          0
      );
const filteredValues = vout.value.filter(item => typeof item === 'bigint');
      const change = filteredValues[0] - amountsToTransfer[i];
      if (change > 0) {
          const abfChange = abfsOut.slice(i * 32 + changeOffset * 32 + 32, i * 32 + changeOffset * 32 + 64);
          const vbfChange = vbfsOut.slice(i * 32 + changeOffset * 32 + 32, i * 32 + changeOffset * 32 + 64);

          const changeGenerator = wally.asset_generator_from_bytes(vout.assetId, abfChange);
          const changeValueCommitment = wally.asset_value_commitment(change, vbfChange, changeGenerator);
console.log(this.publicBlindingKey,'publicBlindingKey')

          const changeRangeProof = wally.asset_rangeproof(
              change,
              this.publicBlindingKey,
              changeEphemeralPrivkey,
              vout.assetId,
              abfChange,
              vbfChange,
              changeValueCommitment,
              this.scriptPubKey,
              changeGenerator,
              min_val,
              0,
              36
          );

          const changeSurjectionProof = wally.asset_surjectionproof(
              vout.assetId,
              abfChange,
              changeGenerator,
              ParentAccount.randomBytes(32),
              concatAssetIds,
              concatAbfs,
              concatAssetGenerators
          );

          wally.tx_add_elements_raw_output(
              outputTx,
              this.scriptPubKey,
              changeGenerator,
              changeValueCommitment,
              changeEphemeralPubkey,
              changeSurjectionProof,
              changeRangeProof,
              0
          );

          changeOffset++;
      }
  }
  return outputTx;
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
      const UnBlindedTx = await import("./unblindedTx.js").then(
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
export default ChildAccount;
