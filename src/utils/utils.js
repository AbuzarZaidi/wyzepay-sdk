import BigNumber from "bignumber.js";
export function hex2ascii(hexx) {
  let hex = hexx.toString();
  let str = "";
  for (let i = 0; i < hex.length && hex.substr(i, 2) !== "00"; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}
export function hex2Utf8(hexx) {
  let hex = hexx.toString();
  return decodeURIComponent("%" + hex.match(/.{1,2}/g)?.join("%"));
}

export const DIVIDE_FACTOR = 1000000;

export function addAmount(txid, vout, balancesByAsset) {
  const assetData = balancesByAsset[vout.asset];
  const voutAmount = new BigNumber(vout.value).dividedBy(DIVIDE_FACTOR);
  if (!assetData) {
    balancesByAsset[vout.asset] = {
      amount: voutAmount,
      amountPerUtxo: [{ txid, amount: voutAmount, vout: vout.n }],
    };
    return;
  }
  if (assetData && assetData.amount) {
    balancesByAsset[vout.asset] = {
      ...balancesByAsset[vout.asset],
      amount: voutAmount.plus(assetData.amount),
      amountPerUtxo: [
        ...balancesByAsset[vout.asset].amountPerUtxo,
        { txid, amount: voutAmount, vout: vout.n },
      ],
    };
    return;
  }
  balancesByAsset[vout.asset] = {
    ...balancesByAsset[vout.asset],
    amount: voutAmount,
    amountPerUtxo: [
      ...balancesByAsset[vout.asset].amountPerUtxo,
      { txid, amount: voutAmount, vout: vout.n },
    ],
  };
}

export function appendAssetMetadataIfNotExists(asset, assetMetadata, balancesByAsset) {
  if (!balancesByAsset[asset].assetMetadata) {
    balancesByAsset[asset] = {
      ...balancesByAsset[asset],
      assetMetadata: assetMetadata,
    };
  }
}

export function sortByEarliestUnlockDate(assetArr) {
  assetArr.sort((a, b) => {
    if (a.unlockDate > b.unlockDate) {
      return 1;
    }
    if (a.unlockDate < b.unlockDate) {
      return -1;
    }
    return 0;
  });
}

export function sortByBiggestAmount(amountPerUtxo) {
  amountPerUtxo.sort((a, b) => {
    if (a.amount.isLessThan(b.amount)) {
      return 1;
    }
    if (a.amount.isGreaterThan(b.amount)) {
      return -1;
    }
    return 0;
  });
}

export function getUtxosForAmount(amountToSettle, amountPerUtxo) {
  const chosenUtxos = [];
  let missingAmount = amountToSettle;

  for (const utxo of amountPerUtxo) {
    if (utxo.amount.isGreaterThanOrEqualTo(missingAmount)) {
      chosenUtxos.push({ ...utxo, amount: missingAmount });
      break;
    }
    chosenUtxos.push(utxo);
    missingAmount = missingAmount.minus(utxo.amount);
  }

  return chosenUtxos;
}

