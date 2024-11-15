import { getBalances, getUserAddress } from "./utils/wyzepayFunc";

import BigNumber from "bignumber.js";
import {
    BalancesByAsset,
    AssetMetadata,
    AmountPerUtxo,
    Account,
    Merchant,
    Token
  } from './types';


export const generateAddress = async (): Promise<{
  mnemonic: string;
  confidentialAddress: string;
  address: string;
}> => {
  const userAddresses: Account = await getUserAddress();

  console.log(userAddresses, 'userAddresses');
  return {
    mnemonic:userAddresses.mnemonic,
    confidentialAddress: userAddresses.confidentialAddress,
    address: userAddresses.address,
  };
};

export const getBalancesByMerchant = async (): Promise<any> => {
  const response = await _getBalancesByMerchant();
  return response;
};
const findMerchantByTicker =
  (assetMetadata?: AssetMetadata) => (balance: Merchant) =>
    balance.id === assetMetadata?.ticker;

const getTxIdsByUtxo = (amountPerUtxo: AmountPerUtxo[]) =>
  amountPerUtxo.map((transaction) => transaction.txid);
const _getBalancesByMerchant = async (): Promise<Merchant[] | null> => {
    let sdkBalances: BalancesByAsset = await getBalances();
  
  
    const assetIds = Object.keys(sdkBalances!);
    const balancesByMerchant = Object.values(sdkBalances!).reduce(
      (merchants: Merchant[], balance, currentIndex) => {
        const assetId = assetIds[currentIndex];
        const {amount, assetMetadata} = balance;
        let merchantIndex = merchants.findIndex(
          findMerchantByTicker(assetMetadata),
        );
        const token: Token = {
          key: assetId,
          value: amount,
          txs: balance.amountPerUtxo?.map((a:any) => ({
            txid: a.txid,
            amount: a.amount,
          })),
        };
        if (merchantIndex > -1) {
          const merchant = merchants[merchantIndex];
          merchant.balance = merchant.balance!.plus(token.value);
          merchant.txIds = [
            ...merchant.txIds!,
            ...getTxIdsByUtxo(balance.amountPerUtxo),
          ];
          merchant.tokens?.push(token);
        } else {
          merchants.push({
              id: assetMetadata!.ticker,
              name: assetMetadata!.name,
              balance: new BigNumber(token.value),
              txIds: getTxIdsByUtxo(balance.amountPerUtxo),
              tokens: [token],
              rating: 0,
              ticker: "",
              branches: [],
              stripeAccountId: "",
              address: "",
              addressCoordinates: "",
              description: "",
              mainImageLink: "",
              appLogoLink: "",
              latitude: 0,
              longitude: 0,
              isCanaryWharf: false,
              merchantGroup: ""
          });
        }
        return merchants;
      },
      [],
    );
    return balancesByMerchant;
  };

