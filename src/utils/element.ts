import axios from "axios";
import { unblindTx, deriveAccountNative } from "./core";
import BigNumber from "bignumber.js";

// Define types for the API responses and helper functions
interface Utxo {
  txid: string;
  vout: number[];
}

interface Transaction {
  txid: string;
  [key: string]: any;
}

interface AssetIssuance {
  issuance_txin: string;
}

interface UnblindedVout {
  n: number;
  value: BigNumber;
  [key: string]: any;
}

interface UnblindedVouts {
  vout: UnblindedVout[];
}

interface WalletInfo {
  [txid: string]: UnblindedVout[];
}

const _getFromBlockExplorer = async (url: string): Promise<any> => {
  return axios.get(`https://explorer-qa2.abwp.io${url}`);
};

export const getBlindedUtxos = async (address: string): Promise<Utxo[]> => {
  try {
    const response = await _getFromBlockExplorer(`/address/${address}/utxo`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blinded UTXOs:", error);
    throw error;
  }
};

export const getRawTransaction = async (txid: string): Promise<string> => {
  try {
    const response = await _getFromBlockExplorer(`/tx/${txid}/hex`);
    return response.data;
  } catch (error) {
    console.error("Error fetching raw transaction:", error);
    throw error;
  }
};

export const getTransaction = async (txid: string): Promise<Transaction> => {
  try {
    const response = await _getFromBlockExplorer(`/tx/${txid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
};

export const getTransactionHistory = async (address: string, pastTxid = ""): Promise<any> => {
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

export const getMempoolTransactionHistory = async (address: string): Promise<any> => {
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

export const getAssetIssuanceTxin = async (assetId: string): Promise<AssetIssuance> => {
  try {
    const response = await _getFromBlockExplorer(`/asset/${assetId}`);
    return response.data.issuance_txin;
  } catch (error) {
    console.error("Error fetching asset issuance transaction input:", error);
    throw error;
  }
};

const unblindTxHere = async (mnemonic: string, childNo: number, rawTx: string): Promise<UnblindedVouts> => {
  const ubtxStr = await unblindTx(mnemonic, childNo, rawTx);
  const ubtx = JSON.parse(ubtxStr);
  ubtx.vout.forEach((vout: UnblindedVout) => {
    vout.value = new BigNumber(vout.value);
  });
  return ubtx;
};

const _getUnblindedVouts = async (
  txid: string,
  { includeOnlyNs, disableCache }: { includeOnlyNs: number[], disableCache?: boolean }
): Promise<{ rawHex: string, unblindedVouts: UnblindedVout[] }> => {
  const rawTx = await getRawTransaction(txid);
  const unblindedVouts = await unblindTxHere(
    "abuse pelican major nut another stomach portion tool believe kid intact dune march anchor exile utility wine project ghost easy renew exhaust weapon daughter",
    0,
    rawTx
  );
  const vouts = includeOnlyNs.length
    ? unblindedVouts.vout.filter((el) => includeOnlyNs.includes(el.n))
    : unblindedVouts.vout;
  return { rawHex: rawTx, unblindedVouts: vouts };
};

export const getWalletInfo = async (): Promise<WalletInfo> => {
  const address = "2dqBJS7gPwALSPEkSuJp5pfaw2eNB15knJ7";
  const blindedUtxos = await getBlindedUtxos(address);
  console.log(blindedUtxos, "blindedUtxos");
  const unblindedUtxosByTxid: WalletInfo = {};

  for (const blindedUtxo of blindedUtxos) {
    const txid = blindedUtxo.txid;
    const unspentNsForTxid = blindedUtxos.reduce((Ns: number[][], utxo: Utxo) => {
        if (utxo.txid === txid) {
          Ns.push(utxo.vout); // utxo.vout is a number[], which is valid for Ns as a number[][]
        }
        return Ns;
      }, []);
      const { rawHex, unblindedVouts } = await _getUnblindedVouts(txid, {
        includeOnlyNs: unspentNsForTxid.flat(), // Flatten the array to get a number[]
      });
      
    unblindedUtxosByTxid[txid] = unblindedVouts;
  }

  return unblindedUtxosByTxid;
};

export const deriveAccount = async (mnemonic: string): Promise<{ confidentialAddress: string; address: string }> => {
  const res = await deriveAccountNative(mnemonic);
  return res;
};
