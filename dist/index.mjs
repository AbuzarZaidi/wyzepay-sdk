import "./chunk-VCQC6566.mjs";

// src/utils/utils.ts
import BigNumber from "bignumber.js";

// src/utils/element.ts
import axios from "axios";

// src/utils/vin.ts
var VIn = class {
  txId;
  // Assuming txId is a Uint8Array
  voutN;
  txIdHex = null;
  constructor(txId, voutN) {
    this.txId = txId;
    this.voutN = voutN;
  }
  getTxId() {
    return this.txId;
  }
  getVoutN() {
    return this.voutN;
  }
  async getTxIdHex() {
    if (!this.txIdHex) {
      const wally = await import("wallycore");
      this.txIdHex = wally.hex_from_bytes(this.flipBytes(this.txId));
    }
    return this.txIdHex;
  }
  flipBytes(bytes) {
    return Uint8Array.from(bytes).reverse();
  }
};
var vin_default = VIn;

// src/utils/vout.ts
var VOut = class _VOut {
  value;
  assetId;
  assetGenerator;
  scriptPubKey;
  n;
  abf;
  vbf;
  txId;
  assetIdHex = null;
  constructor(value, assetId, assetGenerator, scriptPubKey, n, abf, vbf, parentTx) {
    this.value = value;
    this.assetId = assetId;
    this.assetGenerator = assetGenerator;
    this.scriptPubKey = scriptPubKey;
    this.n = n;
    this.abf = abf;
    this.vbf = vbf;
    this.txId = parentTx;
  }
  static async create(value, assetId, assetGenerator, scriptPubKey, n, abf, vbf, parentTx) {
    const wally = await import("wallycore");
    const txId = wally.sha256d(wally.tx_to_bytes(parentTx, 0));
    return new _VOut(value, assetId, assetGenerator, scriptPubKey, n, abf, vbf, txId);
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
    return Uint8Array.from(bytes).reverse();
  }
};
var vout_default = VOut;

// src/utils/childAccount.ts
var ChildAccount = class _ChildAccount {
  mnemonic;
  masterKey;
  seed;
  childNo;
  derivedKey;
  address;
  confidentialAddress;
  masterBlindingKeyHex;
  scriptPubKey;
  scriptPubKeyHex;
  publicBlindingKey;
  privateBlindingKey;
  privateBlindingKeyHex;
  publicBlindingKeyHex;
  privkeyHex;
  pubkeyHex;
  constructor(mnemonic, masterKey, seed, childNo, derivedKey, address, confidentialAddress, masterBlindingKeyHex, scriptPubKey, scriptPubKeyHex, publicBlindingKey, privateBlindingKey, privateBlindingKeyHex, publicBlindingKeyHex, privkeyHex, pubkeyHex) {
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
    const publicBlindingKey = wally.ec_public_key_from_private_key(privateBlindingKey);
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
    return new _ChildAccount(
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
      const UnBlindedTx = await import("./unblindedTx-CS3LAJLI.mjs").then(
        (module) => module.default
      );
      const numInputs = await Wally.tx_get_num_inputs(tx);
      const vins = [];
      for (let i = 0; i < numInputs; i++) {
        const voutN = await Wally.tx_get_input_index(tx, i);
        const txId = await Wally.tx_get_input_txhash(tx, i);
        vins.push(new vin_default(txId, voutN));
      }
      const numOutputs = await Wally.tx_get_num_outputs(tx);
      const vouts = [];
      let voutsInSize = 0;
      for (let vout = 0; vout < numOutputs; vout++) {
        const scriptPubkeyOut = Wally.tx_get_output_script(tx, vout);
        if (!Buffer.from(scriptPubkeyOut).equals(Buffer.from(this.scriptPubKey))) {
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
        vouts[voutsInSize] = await vout_default.create(
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
    return this.masterBlindingKeyHex;
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
    return this.privkeyHex;
  }
  getPubkey() {
    return this.pubkeyHex;
  }
};
var childAccount_default = ChildAccount;

// src/utils/parentAccount.ts
import { mnemonicToSeed } from "bip39";
import crypto from "crypto";
var ParentAccount = class _ParentAccount {
  mnemonic;
  masterKey;
  seed;
  constructor(mnemonic, masterKey = null, seed = null) {
    this.mnemonic = mnemonic;
    this.masterKey = masterKey;
    this.seed = seed;
  }
  // Create a new ParentAccount from a mnemonic
  static async create(mnemonic) {
    const wally = await import("wallycore");
    const seed = await mnemonicToSeed(mnemonic);
    const masterKey = wally.bip32_key_from_seed(
      new Uint8Array(seed),
      wally.BIP32_VER_MAIN_PRIVATE,
      // Type assertion
      0
    );
    return new _ParentAccount(mnemonic, masterKey, seed);
  }
  // Derive a child account from the ParentAccount
  async deriveAccount(childNo) {
    const childAccount = await childAccount_default.create(
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
  // Generate random bytes of a given length
  static randomBytes(byteLen) {
    return crypto.randomBytes(byteLen);
  }
  // Generate an ephemeral key (32 random bytes)
  static generateEphemeralKey() {
    return _ParentAccount.randomBytes(32);
  }
};
var parentAccount_default = ParentAccount;

// src/utils/core.ts
var unblindTx = async (mnemonic, childNo, rawTxHex) => {
  return new Promise(async (resolve, reject) => {
    try {
      const account = await parentAccount_default.create(mnemonic);
      const childAccount = await account.deriveAccount(childNo);
      const ubtx = await childAccount.unBlindTxHex(rawTxHex);
      const ubTxJson = {
        txid: ubtx.getIdHex(),
        vin: [],
        vout: []
      };
      for (const vin of await ubtx.getVins()) {
        ubTxJson.vin.push({
          vout: await vin.getVoutN(),
          txid: await vin.getTxIdHex()
        });
      }
      for (const vout of await ubtx.getVouts()) {
        const valueArray = await vout.getValue();
        const processedValue = valueArray.map((item) => {
          if (item instanceof Uint8Array) {
            return Buffer.from(item).toString("hex");
          } else if (typeof item === "bigint") {
            return item.toString();
          } else {
            return String(item);
          }
        });
        ubTxJson.vout.push({
          value: processedValue[3],
          asset: await vout.getAssetIdHex(),
          n: await vout.getN()
        });
      }
      resolve(JSON.stringify(ubTxJson));
    } catch (error) {
      reject(error.message);
    }
  });
};
var deriveAccountNative = async (mnemonic) => {
  const account = await parentAccount_default.create(mnemonic);
  const childAccount = await account.deriveAccount(0);
  return childAccount;
};

// src/utils/element.ts
import BigNumber2 from "bignumber.js";
var _getFromBlockExplorer = async (url) => {
  return axios.get(`https://explorer-qa2.abwp.io${url}`);
};
var getBlindedUtxos = async (address) => {
  try {
    const response = await _getFromBlockExplorer(`/address/${address}/utxo`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blinded UTXOs:", error);
    throw error;
  }
};
var getRawTransaction = async (txid) => {
  try {
    const response = await _getFromBlockExplorer(`/tx/${txid}/hex`);
    return response.data;
  } catch (error) {
    console.error("Error fetching raw transaction:", error);
    throw error;
  }
};
var unblindTxHere = async (mnemonic, childNo, rawTx) => {
  const ubtxStr = await unblindTx(mnemonic, childNo, rawTx);
  const ubtx = JSON.parse(ubtxStr);
  ubtx.vout.forEach((vout) => {
    vout.value = new BigNumber2(vout.value);
  });
  return ubtx;
};
var _getUnblindedVouts = async (txid, { includeOnlyNs, disableCache }) => {
  const rawTx = await getRawTransaction(txid);
  const unblindedVouts = await unblindTxHere(
    "abuse pelican major nut another stomach portion tool believe kid intact dune march anchor exile utility wine project ghost easy renew exhaust weapon daughter",
    0,
    rawTx
  );
  const vouts = includeOnlyNs.length ? unblindedVouts.vout.filter((el) => includeOnlyNs.includes(el.n)) : unblindedVouts.vout;
  return { rawHex: rawTx, unblindedVouts: vouts };
};
var getWalletInfo = async () => {
  const address = "2dqBJS7gPwALSPEkSuJp5pfaw2eNB15knJ7";
  const blindedUtxos = await getBlindedUtxos(address);
  console.log(blindedUtxos, "blindedUtxos");
  const unblindedUtxosByTxid = {};
  for (const blindedUtxo of blindedUtxos) {
    const txid = blindedUtxo.txid;
    const unspentNsForTxid = blindedUtxos.reduce((Ns, utxo) => {
      if (utxo.txid === txid) {
        Ns.push(utxo.vout);
      }
      return Ns;
    }, []);
    const { rawHex, unblindedVouts } = await _getUnblindedVouts(txid, {
      includeOnlyNs: unspentNsForTxid.flat()
      // Flatten the array to get a number[]
    });
    unblindedUtxosByTxid[txid] = unblindedVouts;
  }
  return unblindedUtxosByTxid;
};
var deriveAccount = async (mnemonic) => {
  const res = await deriveAccountNative(mnemonic);
  return res;
};

// src/utils/wyzepayFunc.ts
import { generateMnemonic as generateMnemonicBip39 } from "bip39";
var getUserAddress = async () => {
  const entropy = 256;
  const mnemonic = generateMnemonicBip39(entropy);
  const res = await deriveAccount(mnemonic);
  return { ...res, mnemonic };
};
var getBalances = async () => {
  const unblindedVoutsByTxid = await getWalletInfo();
  const balancesByAsset = {};
  return balancesByAsset;
};

// src/functions.ts
import BigNumber3 from "bignumber.js";
var generateAddress = async () => {
  const userAddresses = await getUserAddress();
  console.log(userAddresses, "userAddresses");
  return {
    mnemonic: userAddresses.mnemonic,
    confidentialAddress: userAddresses.confidentialAddress,
    address: userAddresses.address
  };
};
var getBalancesByMerchant = async () => {
  const response = await _getBalancesByMerchant();
  return response;
};
var findMerchantByTicker = (assetMetadata) => (balance) => balance.id === assetMetadata?.ticker;
var getTxIdsByUtxo = (amountPerUtxo) => amountPerUtxo.map((transaction) => transaction.txid);
var _getBalancesByMerchant = async () => {
  let sdkBalances = await getBalances();
  const assetIds = Object.keys(sdkBalances);
  const balancesByMerchant = Object.values(sdkBalances).reduce(
    (merchants, balance, currentIndex) => {
      const assetId = assetIds[currentIndex];
      const { amount, assetMetadata } = balance;
      let merchantIndex = merchants.findIndex(
        findMerchantByTicker(assetMetadata)
      );
      const token = {
        key: assetId,
        value: amount,
        txs: balance.amountPerUtxo?.map((a) => ({
          txid: a.txid,
          amount: a.amount
        }))
      };
      if (merchantIndex > -1) {
        const merchant = merchants[merchantIndex];
        merchant.balance = merchant.balance.plus(token.value);
        merchant.txIds = [
          ...merchant.txIds,
          ...getTxIdsByUtxo(balance.amountPerUtxo)
        ];
        merchant.tokens?.push(token);
      } else {
        merchants.push({
          id: assetMetadata.ticker,
          name: assetMetadata.name,
          balance: new BigNumber3(token.value),
          txIds: getTxIdsByUtxo(balance.amountPerUtxo),
          tokens: [token],
          rating: 0,
          ticker: "",
          branches: [],
          stripeAccountId: "",
          address: "",
          addressCoordinates: "",
          description: "",
          mainImageLink: "",
          appLogoLink: "",
          latitude: 0,
          longitude: 0,
          isCanaryWharf: false,
          merchantGroup: ""
        });
      }
      return merchants;
    },
    []
  );
  return balancesByMerchant;
};
export {
  generateAddress,
  getBalancesByMerchant
};
