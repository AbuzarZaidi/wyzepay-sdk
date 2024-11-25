import axios from "axios";
import { unblindTx, deriveAccountNative, createSignedBlindedTx } from "./core.js";
import BigNumber from "bignumber.js";
const _getFromBlockExplorer = async (url) => {
  return axios.get(`https://explorer-qa2.abwp.io${url}`);
};
export const sendToAddress=async(
  destinationAddress,
  amountPerOutput)=> {
  const respone=createSignedBlindedTx(
    "abuse pelican major nut another stomach portion tool believe kid intact dune march anchor exile utility wine project ghost easy renew exhaust weapon daughter",
    0,
    destinationAddress,
    amountPerOutput,
  );
  return respone;
}
export const getBlindedUtxos = async (address) => {
  try {
    const response = await _getFromBlockExplorer(`/address/${address}/utxo`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blinded UTXOs:", error);
    throw error;
  }
};

export const getRawTransaction = async (txid) => {
  try {
    const response = await _getFromBlockExplorer(`/tx/${txid}/hex`);
    return response.data;
  } catch (error) {
    console.error("Error fetching raw transaction:", error);
    throw error;
  }
};

export const getTransaction = async (txid) => {
  try {
    const response = await _getFromBlockExplorer(`/tx/${txid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
};

export const getTransactionHistory = async (address, pastTxid = "") => {
  try {
    const response = await _getFromBlockExplorer(
      `/address/${address}/txs/chain${pastTxid ? `/${pastTxid}` : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
};

export const getMempoolTransactionHistory = async (address) => {
  try {
    const response = await _getFromBlockExplorer(
      `/address/${address}/txs/mempool`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mempool transaction history:", error);
    throw error;
  }
};

export const getAssetIssuanceTxin = async (assetId) => {
  try {
    const response = await _getFromBlockExplorer(`/asset/${assetId}`);
    return response.data.issuance_txin;
  } catch (error) {
    console.error("Error fetching asset issuance transaction input:", error);
    throw error;
  }
};
const unblindTxHere = async (mnemonic, childNo, rawTx) => {
  const ubtxStr = await unblindTx(mnemonic, childNo, rawTx);
  const ubtx = JSON.parse(ubtxStr);
  ubtx.vout.forEach((vout) => (vout.value = new BigNumber(vout.value)));
  return ubtx;
};
const _getUnblindedVouts = async (txid, { includeOnlyNs, disableCache }) => {
  const rawTx = await getRawTransaction(txid);
  const unblindedVouts = await unblindTxHere(
    // this.mnemonic,
    "abuse pelican major nut another stomach portion tool believe kid intact dune march anchor exile utility wine project ghost easy renew exhaust weapon daughter",
    0,
    rawTx
  );
  const vouts = includeOnlyNs.length
    ? unblindedVouts.vout.filter((el) => includeOnlyNs.includes(el.n))
    : unblindedVouts.vout;
  return { rawHex: rawTx, unblindedVouts: vouts };
};
export const getWalletInfo = async () => {
  const address = "2dqBJS7gPwALSPEkSuJp5pfaw2eNB15knJ7";
  const blindedUtxos = await getBlindedUtxos(address);
  // console.log(blindedUtxos, "blindedUtxos");
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
      includeOnlyNs: unspentNsForTxid,
    });
    unblindedUtxosByTxid[txid] = unblindedVouts;
  }

  return unblindedUtxosByTxid;
};
export const deriveAccount = async (mnemonic) => {
  const res = await deriveAccountNative(mnemonic);
  return res;
};
