import BigNumber from 'bignumber.js';
export interface Account {
  address: string;
  confidentialAddress: string;
  mnemonic: string;
}

export interface StorageProvider {
  getItem: Function;
  setItem: Function;
  removeItem: Function;
  getAllKeys: Function;
}

export interface AssetMetadata {
  [x: string]: string;
  merchantName: string;
  ticker: string;
}

export interface Vout {
  value: number;
  asset: string;
  n: number;
  assetMetadata?: AssetMetadata;
}

export interface AmountPerUtxo {
  txid: string;
  vout: number;
  amount: BigNumber;
}
export interface BalancesByAsset {
    assetMetadata?: AssetMetadata;
  }
export type UnblindedVoutsByTxid = Record<string, Vout[]>;
// export type BalancesByAsset = Record<
//   string,
//   {
//     // amount: BigNumber;
//     assetMetadata?: AssetMetadata;
//     // amountPerUtxo: AmountPerUtxo[];
//     // unlocked?: Boolean;
//   }
// >;

export enum HistoryAction {
  PURCHASE = 'purchase',
  TRANSFER = 'transfer',
  REDEMPTION = 'redemption',
  RECEIVED = 'received',
}

export enum TransactionType {
  RECEIVE = 'receive',
  SPEND = 'spend',
}
export interface Transaction {
  txid: string;
  unblindedVouts: Vout[];
  unblindedVinVouts?: Vout[];
  inputAddresses?: string[];
  type: TransactionType;
  destination?: string;
  time: number;
  pending: boolean;
}
export interface HistoryEntry {
  merchantTicker: string;
  createdAt: number;
  amount: BigNumber;
  action: HistoryAction;
  destination?: string;
  from?: string;
  pending: boolean;
  phoneNumber: string | undefined;
}
export interface Friend {
  name: string;
  plainAddress: string;
  phoneNumber: string;
  [K: string]: unknown;
}

export interface AggregateTxOutputs {
  hex: string;
  vouts: Record<number, BigNumber>;
}
export interface Token {
    key: string;
    value: BigNumber;
    children?: Token[];
    txs: TokenTransaction[];
  }
export class InsufficientFundsError extends Error {}
export interface Merchant {
    rating: number;
    id: string;
    ticker: string;
    name: string;
    tokens?: Token[];
    category?: number;
    icon?: string;
    branches: Branch[];
    balance?: BigNumber;
    available?: BigNumber;
    locked?: BigNumber;
    assets?: Asset[];
    currentSavings?: BigNumber;
    savings?: BigNumber;
    txIds?: string[];
    discount?: BigNumber;
    shopOpen?: boolean; // to be displayed
    shopAvailable?: boolean | string; // to make purchases
    minDiscount?: BigNumber;
    maxDiscount?: BigNumber;
    minValue?: BigNumber;
    maxValue?: BigNumber;
    stripeAccountId: string;
  
    earliestAvailableExerciseHorizon?: number;
    latestAvailableExerciseHorizon?: number;
    info?: any;
    address: string;
    addressCoordinates: string;
    description: string;
    mainImageLink: string;
    appLogoLink: string;
    latitude: number;
    longitude: number;
    categories?: MerchantCategory[];
    isCanaryWharf: boolean;
    image?: string;
    merchantGroup: string;
    cashbackActive?: boolean;
    cashback?: string;
  }