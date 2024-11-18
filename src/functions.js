import { getBalances, getUserAddress } from "./utils/wyzepayFunc.js";
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
  console.log(userAddresses,'userAddresses')
  return userAddresses;
};
export const getBalancesByMerchant = async () => {
  const response = await _getBalancesByMerchant();
  return response;
};
const merchantListHandler = async () => {
  const merchants = await axios.get(
    "https://qa2.abwp.io/api/v2/consumer/merchants",
    {
      headers: {
        Authorization: "Api-Key 584dd6ac-d044-4a87-9358-fee65225b410",
      },
    }
  );
  return merchants.data.merchants;
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
