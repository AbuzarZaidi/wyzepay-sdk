declare const generateAddress: () => Promise<{
    mnemonic: string;
    confidentialAddress: string;
    address: string;
}>;
declare const getBalancesByMerchant: () => Promise<any>;

export { generateAddress, getBalancesByMerchant };
