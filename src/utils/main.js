import {
  hex2Utf8,
  addAmount,
  appendAssetMetadataIfNotExists,
  getUtxosForAmount,
  sortByBiggestAmount,
  DIVIDE_FACTOR,
} from "./utils.js";
import BigNumber from "bignumber.js";
import {
  getAssetIssuanceTxin,
  getTransaction,
  getWalletInfo,
  deriveAccount,
  sendToAddress,
  getRawTransaction
} from "./element.js";
export const getUserAddress = async (mnemonic) => {
  const res = await deriveAccount(mnemonic);
  return res;
};

export const _extractAssetMetadata = async (assetId) => {
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
const _findEligibleRedemptionAssets=(
  balancesByAsset,
  merchantTicker,
)=>{
  const assetsEligibleForRedemption = [];
  for (const assetId in balancesByAsset) {
    const assetData = balancesByAsset[assetId];
    if (assetData.assetMetadata?.ticker === merchantTicker) {
      assetsEligibleForRedemption.push({
        assetId,
        amount: assetData.amount,
        amountPerUtxo: assetData.amountPerUtxo,
      });
    }
  }
  return assetsEligibleForRedemption;
}
const _generateRedemptionTxs=async(
  chosenUtxos,
  destinationAddress,
)=> {
  const inputsToSpend= [];
  const utxosByTxid= {};
  for (const chosenUtxo of chosenUtxos) {
    if (!(chosenUtxo.txid in utxosByTxid)) {
      const inputTx = await getRawTransaction(chosenUtxo.txid)
      utxosByTxid[chosenUtxo.txid] = {hex: inputTx, vouts: {}};
    }
    utxosByTxid[chosenUtxo.txid].vouts[chosenUtxo.vout] =
      chosenUtxo.amount.times(DIVIDE_FACTOR);
  }

  for (const txid in utxosByTxid) {
    inputsToSpend.push(utxosByTxid[txid]);
  }
  return [
    await sendToAddress(destinationAddress, inputsToSpend),
  ];
}
export const redeemTokens=async(
  destinationAddress,
  merchantTicker,
  redemptionAmount,
)=> {
  const balancesByAsset = await getBalances();
  const assetsEligibleForRedemption = _findEligibleRedemptionAssets(
    balancesByAsset,
    merchantTicker,
  );

  let chosenUtxos = [];

  let missingAmount = redemptionAmount;

  for (const eligibleAsset of assetsEligibleForRedemption) {
    sortByBiggestAmount(eligibleAsset.amountPerUtxo);
    if (eligibleAsset.amount.isGreaterThanOrEqualTo(missingAmount)) {
      chosenUtxos = chosenUtxos.concat(
        getUtxosForAmount(missingAmount, eligibleAsset.amountPerUtxo),
      );
      missingAmount = new BigNumber(0);
      break;
    }
    chosenUtxos = chosenUtxos.concat(
      getUtxosForAmount(eligibleAsset.amount, eligibleAsset.amountPerUtxo),
    );
    missingAmount = missingAmount.minus(eligibleAsset.amount);
  }

  if (missingAmount.isGreaterThan(0)) {
    throw new Error('Insufficient funds, please purchase more funds.');
  }
  return _generateRedemptionTxs(chosenUtxos, destinationAddress);
}