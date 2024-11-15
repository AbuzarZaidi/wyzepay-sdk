import BigNumber from "bignumber.js";

function hex2ascii(hexx: string): string {
  let hex = hexx.toString();
  let str = "";
  for (let i = 0; i < hex.length && hex.substr(i, 2) !== "00"; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

function hex2Utf8(hexx: string): string {
  let hex = hexx.toString();
  return decodeURIComponent("%" + hex.match(/.{1,2}/g)?.join("%"));
}

const DIVIDE_FACTOR = 1000000;

interface Vout {
  asset: string;
  value: string;
  n: number;
}

interface AssetData {
  amount: BigNumber;
  amountPerUtxo: { txid: string; amount: BigNumber; vout: number }[];
  assetMetadata?: any;
}

interface BalancesByAsset {
  [asset: string]: AssetData;
}

function addAmount(
  txid: string,
  vout: Vout,
  balancesByAsset: BalancesByAsset
): void {
  const assetData = balancesByAsset[vout.asset];
  const voutAmount = new BigNumber(vout.value).dividedBy(DIVIDE_FACTOR);
  if (!assetData) {
    balancesByAsset[vout.asset] = {
      amount: voutAmount,
      amountPerUtxo: [{ txid, amount: voutAmount, vout: vout.n }],
    };
    return;
  }
  balancesByAsset[vout.asset] = {
    ...assetData,
    amount: assetData.amount.plus(voutAmount),
    amountPerUtxo: [
      ...assetData.amountPerUtxo,
      { txid, amount: voutAmount, vout: vout.n },
    ],
  };
}

function appendAssetMetadataIfNotExists(
  asset: string,
  assetMetadata: any,
  balancesByAsset: BalancesByAsset
): void {
  if (!balancesByAsset[asset].assetMetadata) {
    balancesByAsset[asset] = {
      ...balancesByAsset[asset],
      assetMetadata: assetMetadata,
    };
  }
}

interface Asset {
  unlockDate: number;
}

function sortByEarliestUnlockDate(assetArr: Asset[]): void {
  assetArr.sort((a, b) => a.unlockDate - b.unlockDate);
}

function sortByBiggestAmount(
  amountPerUtxo: { amount: BigNumber; txid: string; vout: number }[]
): void {
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

function getUtxosForAmount(
  amountToSettle: BigNumber,
  amountPerUtxo: { amount: BigNumber; txid: string; vout: number }[]
): { amount: BigNumber; txid: string; vout: number }[] {
  const chosenUtxos: { amount: BigNumber; txid: string; vout: number }[] = [];
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

export {
  hex2ascii,
  hex2Utf8,
  DIVIDE_FACTOR,
  addAmount,
  appendAssetMetadataIfNotExists,
  sortByEarliestUnlockDate,
  sortByBiggestAmount,
  getUtxosForAmount,
};
