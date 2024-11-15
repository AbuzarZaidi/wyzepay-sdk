"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
    "use strict";
  }
});

// src/utils/byteArrayHelpers.ts
var ByteArrayHelpers, byteArrayHelpers_default;
var init_byteArrayHelpers = __esm({
  "src/utils/byteArrayHelpers.ts"() {
    "use strict";
    init_cjs_shims();
    ByteArrayHelpers = class {
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
    byteArrayHelpers_default = ByteArrayHelpers;
  }
});

// src/utils/unblindedTx.ts
var unblindedTx_exports = {};
__export(unblindedTx_exports, {
  default: () => unblindedTx_default
});
var wally, UnBlindedTx, unblindedTx_default;
var init_unblindedTx = __esm({
  "src/utils/unblindedTx.ts"() {
    "use strict";
    init_cjs_shims();
    wally = __toESM(require("wallycore"));
    init_byteArrayHelpers();
    UnBlindedTx = class {
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
    unblindedTx_default = UnBlindedTx;
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  generateAddress: () => generateAddress,
  getBalancesByMerchant: () => getBalancesByMerchant
});
module.exports = __toCommonJS(src_exports);
init_cjs_shims();

// src/functions.ts
init_cjs_shims();

// src/utils/wyzepayFunc.ts
init_cjs_shims();

// src/utils/utils.ts
init_cjs_shims();
var import_bignumber = __toESM(require("bignumber.js"));

// src/utils/element.ts
init_cjs_shims();
var import_axios = __toESM(require("axios"));

// src/utils/core.ts
init_cjs_shims();

// src/utils/parentAccount.ts
init_cjs_shims();

// src/utils/childAccount.ts
init_cjs_shims();

// src/utils/vin.ts
init_cjs_shims();
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
      const wally2 = await import("wallycore");
      this.txIdHex = wally2.hex_from_bytes(this.flipBytes(this.txId));
    }
    return this.txIdHex;
  }
  flipBytes(bytes) {
    return Uint8Array.from(bytes).reverse();
  }
};
var vin_default = VIn;

// src/utils/vout.ts
init_cjs_shims();
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
    const wally2 = await import("wallycore");
    const txId = wally2.sha256d(wally2.tx_to_bytes(parentTx, 0));
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
    const wally2 = await import("wallycore");
    if (!this.assetIdHex) {
      this.assetIdHex = wally2.hex_from_bytes(this.flipBytes(this.assetId));
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
    const wally2 = await import("wallycore");
    const derivedKey = wally2.bip32_key_from_parent(
      masterKey,
      childNo,
      wally2.BIP32_FLAG_KEY_PRIVATE
    );
    const address = wally2.bip32_key_to_address(
      derivedKey,
      wally2.WALLY_ADDRESS_TYPE_P2PKH,
      wally2.WALLY_ADDRESS_VERSION_P2PKH_LIQUID_REGTEST
    );
    const masterBlindingKey = wally2.asset_blinding_key_from_seed(seed);
    const masterBlindingKeyHex = wally2.hex_from_bytes(masterBlindingKey);
    let scriptPubKey = Buffer.alloc(wally2.WALLY_SCRIPTPUBKEY_P2PKH_LEN);
    scriptPubKey = wally2.address_to_scriptpubkey(
      address,
      wally2.WALLY_NETWORK_LIQUID_REGTEST
    );
    const scriptPubKeyHex = wally2.hex_from_bytes(scriptPubKey);
    const privateBlindingKey = wally2.asset_blinding_key_to_ec_private_key(
      masterBlindingKey,
      scriptPubKey
    );
    const privateBlindingKeyHex = wally2.hex_from_bytes(privateBlindingKey);
    const publicBlindingKey = wally2.ec_public_key_from_private_key(privateBlindingKey);
    const publicBlindingKeyHex = wally2.hex_from_bytes(publicBlindingKey);
    const confidentialAddress = wally2.confidential_addr_from_addr(
      address,
      wally2.WALLY_CA_PREFIX_LIQUID_REGTEST,
      publicBlindingKey
    );
    const privkey = wally2.bip32_key_get_priv_key(derivedKey);
    const privkeyHex = wally2.hex_from_bytes(privkey);
    const pubkey = wally2.ec_public_key_from_private_key(privkey);
    const pubkeyHex = wally2.hex_from_bytes(pubkey);
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
    const wally2 = await import("wallycore");
    const tx = wally2.tx_from_hex(
      txHex,
      wally2.WALLY_TX_FLAG_USE_ELEMENTS | wally2.WALLY_TX_FLAG_USE_WITNESS
    );
    return this.unBlindTx(tx);
  }
  async unBlindTx(tx) {
    try {
      const Wally = await import("wallycore");
      const UnBlindedTx2 = await Promise.resolve().then(() => (init_unblindedTx(), unblindedTx_exports)).then(
        (module2) => module2.default
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
      return new UnBlindedTx2(vins, vouts.slice(0, voutsInSize), tx);
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
var import_bip39 = require("bip39");
var import_crypto = __toESM(require("crypto"));
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
    const wally2 = await import("wallycore");
    const seed = await (0, import_bip39.mnemonicToSeed)(mnemonic);
    const masterKey = wally2.bip32_key_from_seed(
      new Uint8Array(seed),
      wally2.BIP32_VER_MAIN_PRIVATE,
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
    return import_crypto.default.randomBytes(byteLen);
  }
  // Generate an ephemeral key (32 random bytes)
  static generateEphemeralKey() {
    return _ParentAccount.randomBytes(32);
  }
};
var parentAccount_default = ParentAccount;

// src/utils/core.ts
init_unblindedTx();
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
var import_bignumber2 = __toESM(require("bignumber.js"));
var _getFromBlockExplorer = async (url) => {
  return import_axios.default.get(`https://explorer-qa2.abwp.io${url}`);
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
    vout.value = new import_bignumber2.default(vout.value);
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
var import_bip392 = require("bip39");
var getUserAddress = async () => {
  const entropy = 256;
  const mnemonic = (0, import_bip392.generateMnemonic)(entropy);
  const res = await deriveAccount(mnemonic);
  return { ...res, mnemonic };
};
var getBalances = async () => {
  const unblindedVoutsByTxid = await getWalletInfo();
  const balancesByAsset = {};
  return balancesByAsset;
};

// src/functions.ts
var import_bignumber3 = __toESM(require("bignumber.js"));
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
          balance: new import_bignumber3.default(token.value),
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateAddress,
  getBalancesByMerchant
});
