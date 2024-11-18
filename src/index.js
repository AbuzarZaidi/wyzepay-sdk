// Importing functions
import { getAddressHandler, getBalancesByMerchant } from './functions.js';

async function main() {
  try {
    const userAddresses = await getAddressHandler();
    console.log('User Addresses:', userAddresses);

    const merchantBalances = await getBalancesByMerchant();
    console.log('Merchant Balances:', merchantBalances);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
