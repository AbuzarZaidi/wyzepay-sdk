import { getBalances, getUserAddress,redeemTokens } from "./utils/main.js";
import axios from "axios";
import BigNumber from "bignumber.js";
import { generateMnemonic } from "bip39";
export const generateMnemonicHandler = async () => {
  const entropy = 256;
  return generateMnemonic(entropy);
};
export const getAddressHandler = async () => {
 const mnemonic= await generateMnemonicHandler()
  let userAddresses = await getUserAddress(mnemonic);
  return {address:userAddresses.address,confidentialAddress:userAddresses.confidentialAddress,mnemonic};
};
export const getBalancesByMerchant = async () => {
  const response = await _getBalancesByMerchant();
  return response;
};
const _getBalancesByMerchant = async () => {
  const merchantList = [];
  let sdkBalances = await getBalances();
  const assetIds = Object.keys(sdkBalances);
  const balancesByMerchant = Object.values(sdkBalances).reduce(
    (merchants, balance, currentIndex) => {
      const assetId = assetIds[currentIndex];
      const { amount, assetMetadata } = balance;
      let merchantIndex = merchantList.findIndex(
        (merchant) => merchant.ticker === assetMetadata.ticker
      );
      const token = {
        key: assetId,
        value: amount,
        txs: balance.amountPerUtxo?.map((a) => ({
          txid: a.txid,
          amount: a.amount,
        })),
      };
      if (merchantIndex > -1) {
        const merchant = merchants[merchantIndex];
        merchant.balance = merchant.balance.plus(token.value);
        merchant.txIds = [
          ...merchant.txIds,
          ...getTxIdsByUtxo(balance.amountPerUtxo),
        ];
        merchant.tokens?.push(token);
      } else {
        merchants.push({
          id: assetMetadata.ticker,
          name: assetMetadata.name,
          balance: new BigNumber(token.value),
          // txIds: getTxIdsByUtxo(balance.amountPerUtxo),
          tokens: [token],
        });
      }
      return merchants;
    },
    []
  );
  return balancesByMerchant;
};


// destinationAddress,
//   merchantTicker,  
//   redemptionAmount
(async () => {
  let redemptionAmount=new BigNumber(22)
 const transaction= await redeemTokens('AzpueHHe3K5dug5Q5CUu5tCk1PAGM83v4fmLSQD5DKTd4WuUCBXcSQSRYjcLaTjPXmCPukxVfBfjdsmL','DSLB',redemptionAmount)
console.log(transaction,'transaction')
})()