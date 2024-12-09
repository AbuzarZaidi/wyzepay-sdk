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
export const getBalancesByMerchant = async (address,mnemonic) => {
  const response = await _getBalancesByMerchant(address,mnemonic);
  return response;
};
const _getBalancesByMerchant = async (address,mnemonic) => {
  const merchantList = [];
  let sdkBalances = await getBalances(address,mnemonic);
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

// (async ()=>{
//   try {
//     const address="2dqBJS7gPwALSPEkSuJp5pfaw2eNB15knJ7"
//     const mnemonic="abuse pelican major nut another stomach portion tool believe kid intact dune march anchor exile utility wine project ghost easy renew exhaust weapon daughter"
//     const res= await getBalancesByMerchant(address,mnemonic)
//     console.log(res,'res')
//   } catch (error) {
    
//   }
// })()
// destinationAddress,
//   merchantTicker,  
//   redemptionAmount
// (async () => {
// try {
//   let redemptionAmount=new BigNumber(22)
//   const transaction= await redeemTokens('AzpueHHe3K5dug5Q5CUu5tCk1PAGM83v4fmLSQD5DKTd4WuUCBXcSQSRYjcLaTjPXmCPukxVfBfjdsmL','DSLB',redemptionAmount)
//   const res = await axios.post(
//     "https://qa2.abwp.io/api/v2/consumer/transfer",
//     {
//       orderId: "8647f717-246c-485f-a94a-3422ff098557",
//       rawTxs: transaction,
//       // confidentialAddress: "CTEwF9Kxr2e3gz3mTTHGkhzke88CaERAheNuDg4616kkWXmJVpPQyTEtqk2R9oTEPNF9mK2QkaRom6hU"
//     },
//     {
//       headers: {
//         Authorization: "Api-Key 584dd6ac-d044-4a87-9358-fee65225b410"
//       }
//     }
//   );
  
//  // console.log(transaction,'transaction')
//  console.log(res,'res')
// } catch (error) {
//   console.log(error)
// }
// })()