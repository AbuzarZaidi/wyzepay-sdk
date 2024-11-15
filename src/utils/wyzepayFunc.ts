import {
  hex2Utf8,
  addAmount,
  appendAssetMetadataIfNotExists,
} from "./utils";
import BigNumber from "bignumber.js";
import {
  getAssetIssuanceTxin,
  getTransaction,
  getWalletInfo,
  deriveAccount,
} from "./element";
import { generateMnemonic as generateMnemonicBip39 } from "bip39";
// Define types for the returned data from the APIs used.
interface AssetMetadata {
  ticker: string;
  name: string;
  [key: string]: any;
}

interface UnblindedVout {
  asset: string;
  amount: number;
  assetMetadata?: AssetMetadata;
}

interface WalletInfo {
  [txid: string]: UnblindedVout[];
}

// Typing the mnemonic as string, but this could be adjusted based on your use case.
export const getUserAddress = async (): Promise<{ mnemonic:string,confidentialAddress: string; address: string }> => {
  const entropy = 256;
  const mnemonic=generateMnemonicBip39(entropy);
  const res = await deriveAccount(mnemonic);
  return {...res,mnemonic};
};

const _extractAssetMetadata = async (assetId: string): Promise<AssetMetadata> => {
  const issuanceTxin = await getAssetIssuanceTxin(assetId);
  const issuanceTx = await getTransaction(issuanceTxin.txid);
  let assetMetadataHex: string | undefined;

  for (const output of issuanceTx.vout) {
    const scriptType = output.scriptpubkey_type;
    if (scriptType && scriptType === "op_return") {
      assetMetadataHex = output.scriptpubkey_asm.split(" ")[2];
      break;
    }
  }

  if (!assetMetadataHex) throw new Error("Asset metadata not found");

  const decoded = hex2Utf8(assetMetadataHex);
  return JSON.parse(decoded);
};

const _appendAssetMetadata = async (
  unblindedVout: UnblindedVout,
  balancesByAsset: Record<string, { assetMetadata: AssetMetadata }>
): Promise<UnblindedVout> => {
  if (unblindedVout.assetMetadata) {
    appendAssetMetadataIfNotExists(
      unblindedVout.asset,
      unblindedVout.assetMetadata,
      balancesByAsset
    );
    return unblindedVout;
  }

  const assetBalance = balancesByAsset[unblindedVout.asset];
  if (assetBalance?.assetMetadata) {
    unblindedVout.assetMetadata = assetBalance.assetMetadata;
    return unblindedVout;
  }

  const missingMetadata = await _extractAssetMetadata(unblindedVout.asset);
  appendAssetMetadataIfNotExists(
    unblindedVout.asset,
    missingMetadata,
    balancesByAsset
  );
  unblindedVout.assetMetadata = missingMetadata;
  return unblindedVout;
};

const _sumBalancesByAsset = async (
  txid: string,
  unblindedTxVouts: UnblindedVout[],
  balancesByAsset: Record<string, { assetMetadata: AssetMetadata }>
): Promise<UnblindedVout[]> => {
  const updatedCacheVouts: UnblindedVout[] = [];
  for (const unblindedVout of unblindedTxVouts) {
    addAmount(txid, unblindedVout, balancesByAsset);
    const voutWithMetadata = await _appendAssetMetadata(unblindedVout, balancesByAsset);
    updatedCacheVouts.push(voutWithMetadata);
  }

  return updatedCacheVouts;
};

export const getBalances = async (): Promise<Record<string, { assetMetadata: AssetMetadata }>> => {
  const unblindedVoutsByTxid = await getWalletInfo();
  const balancesByAsset: Record<string, { assetMetadata: AssetMetadata }> = {};

  // for (const txid in unblindedVoutsByTxid) {
    // const updatedCacheVouts = await _sumBalancesByAsset(
    //   txid,
    //   unblindedVoutsByTxid[txid],
    //   balancesByAsset
    // );
  // }

  return balancesByAsset;
};
