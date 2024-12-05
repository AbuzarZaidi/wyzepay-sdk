import ParentAccount from "./parentAccount.js";
import VIn from "./vin.js";
import VOut from "./vout.js";
import Destination from './destination.js'
export const createSignedBlindedTx = async (
  mnemonic,
  childNo,
  destinationAddress,
  txPayload,
) => {
  const newRawTx = await createBlindTx(
    mnemonic,
    childNo,
    destinationAddress,
    JSON.stringify(txPayload),
  );
  return newRawTx;
};
async function createBlindTx(mnemonic, childNo, destinationAddress, transactionPayload) {
  try {

    const wally = await import("wallycore");
    const account = await ParentAccount.create(mnemonic);
    const childAccount = await account.deriveAccount(childNo);
      const decodedPayload = JSON.parse(transactionPayload);
      const inputs = [];
      const values = [];
      let vins=[]
      for (const transactionObject of decodedPayload) {
          const ubtx = await childAccount.unBlindTxHex(transactionObject.hex);
          vins=ubtx.vins[0]
          const vouts = transactionObject.vouts;
          console.log(ubtx,'ubtx')
          for (const voutId in vouts) {
              const vout = await ubtx.getVout(parseInt(voutId));
              const value = await vouts[voutId];
            
              if (vout != null && value != null) {
                inputs.push(vout);
                values.push(value);
              } else {
                  throw new Error(
                      `Vout with ID: ${voutId} not found or value format invalid (must be a number)`
                  );
              }
          }
      }
      const destination = await Destination.create(destinationAddress);
      const inputsPrim = inputs;
      const valuesPrim = new BigInt64Array(values);      
      const tx = await  childAccount.createBlindTx(inputsPrim, destination, valuesPrim);
     await childAccount.signTransaction(tx, inputsPrim,vins);
      const blindedTxHex = wally.tx_to_hex(tx, wally.WALLY_TX_FLAG_USE_WITNESS);
    return blindedTxHex
  } catch (error) {
    console.log(error,'error')
  }
}

export const unblindTx = async (mnemonic, childNo, rawTxHex) => {
  return new Promise(async (resolve, reject) => {
    try {
      const account = await ParentAccount.create(mnemonic);
      const childAccount = await account.deriveAccount(childNo);
      const ubtx = await childAccount.unBlindTxHex(rawTxHex);
      const ubTxJson = {
        txid: await ubtx.getIdHex(),
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
