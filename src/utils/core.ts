import ParentAccount from "./parentAccount";
import { mnemonicToSeedSync } from "bip39";
import ChildAccount from "./childAccount";
import VIn from "./vin";
import VOut from "./vout";
const BigNumber = require("bignumber.js");
import UnBlindedTx from "./unblindedTx";
export const unblindTx2 = async (mnemonic, childNo, rawTxHex) => {
  try {
    const account = await ParentAccount.create(mnemonic);
    const childAccount = await account.deriveAccount(childNo);
    const ubtx1 = await childAccount.unBlindTxHex(rawTxHex);
    const ubtx = new UnBlindedTx(ubtx1);
    const ubTxJson = {
      txid: ubtx.getIdHex(),
      vin: ubtx.getVins().map((vin) => {
        const vinObj = new VIn(vin);
        return {
          vout: vinObj.getVoutN(),
          txid: vinObj.getTxIdHex(),
        };
      }),
      vout: ubtx.getVouts().map((vout) => {
        const voutObj = new VOut(vout);
        return {
          value: voutObj.getValue().toString(),
          asset: voutObj.getAssetIdHex(),
          n: voutObj.getN(),
        };
      }),
    };
    return ubTxJson;
  } catch (error) {
    console.error("Failed to unblind transaction:", error.message || error);
    throw error;
  }
};
export const unblindTx = async (mnemonic, childNo, rawTxHex) => {
  return new Promise(async (resolve, reject) => {
    try {
      const account = await ParentAccount.create(mnemonic);
      const childAccount = await account.deriveAccount(childNo);
      const ubtx = await childAccount.unBlindTxHex(rawTxHex);
      const ubTxJson = {
        txid: ubtx.getIdHex(),
        vin: [],
        vout: [],
      };
      for (const vin of await ubtx.getVins()) {
        ubTxJson.vin.push({
          vout: await vin.getVoutN(),
          txid: await vin.getTxIdHex(),
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
          n: await vout.getN(),
        });
      }
      resolve(JSON.stringify(ubTxJson));
    } catch (error) {
      reject(error.message);
    }
  });
};
export const deriveAccountNative = async (mnemonic) => {
  const account = await ParentAccount.create(mnemonic);
  const childAccount = await account.deriveAccount(0);
  return childAccount;
};
