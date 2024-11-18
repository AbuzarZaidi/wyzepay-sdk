import {
  hex2Utf8,
  addAmount,
  appendAssetMetadataIfNotExists,
} from "./utils.js";
import BigNumber from "bignumber.js";
import {
  getAssetIssuanceTxin,
  getTransaction,
  getWalletInfo,
  deriveAccount,
} from "./element.js";
export const getUserAddress = async (mnemonic) => {
  const res = await deriveAccount(mnemonic);
  return res;
};

const _extractAssetMetadata = async (assetId) => {
  const issuanceTxin = await getAssetIssuanceTxin(assetId);
  const issuanceTx = await getTransaction(issuanceTxin.txid);
  let assetMetadataHex;
  for (const output of issuanceTx.vout) {
    const scriptType = output.scriptpubkey_type;
    if (scriptType && scriptType === "op_return") {
      assetMetadataHex = output.scriptpubkey_asm.split(" ")[2];
      break;
    }
  }
  const decoded = hex2Utf8(assetMetadataHex);
  return JSON.parse(decoded);
};
const _appendAssetMetadata = async (unblindedVout, balancesByAsset) => {
  if (unblindedVout.assetMetadata) {
    appendAssetMetadataIfNotExists(
      unblindedVout.asset,
      unblindedVout.assetMetadata,
      balancesByAsset
    );
    return unblindedVout;
  }
  const assetBalance = balancesByAsset[unblindedVout.asset];
  if (assetBalance.assetMetadata) {
    unblindedVout.assetMetadata =
      balancesByAsset[unblindedVout.asset].assetMetadata;
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

const _sumBalancesByAsset = async (txid, unblindedTxVouts, balancesByAsset) => {
  const updatedCacheVouts = [];
  for (const unblindedVout of unblindedTxVouts) {
    addAmount(txid, unblindedVout, balancesByAsset);
    const voutWithMetadata = await _appendAssetMetadata(
      unblindedVout,
      balancesByAsset
    );
    updatedCacheVouts.push(voutWithMetadata);
  }

  return updatedCacheVouts;
};

export const getBalances = async () => {
  const unblindedVoutsByTxid = await getWalletInfo();
  const balancesByAsset = {};

  for (const txid in unblindedVoutsByTxid) {
    const updatedCacheVouts = await _sumBalancesByAsset(
      txid,
      unblindedVoutsByTxid[txid],
      balancesByAsset
    );
  }

  return balancesByAsset;
};
