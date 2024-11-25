class Destination {
    constructor(confidentialAddress,address,blindingPubkey,scriptPubkey){
        this.confidentialAddress=confidentialAddress;
        this.address=address;
        this.blindingPubkey=blindingPubkey;
        this.scriptPubkey=scriptPubkey;
    }
    static async create(confidentialAddress) {
        const wally = await import("wallycore");
        const blindingPubkey = wally.confidential_addr_to_ec_public_key(confidentialAddress, wally.WALLY_CA_PREFIX_LIQUID_REGTEST);
        const address = wally.confidential_addr_to_addr(confidentialAddress, wally.WALLY_CA_PREFIX_LIQUID_REGTEST);
        let scriptPubKey = Buffer.alloc(wally.WALLY_SCRIPTPUBKEY_P2PKH_LEN);
        scriptPubKey = wally.address_to_scriptpubkey(
          address,
          wally.WALLY_NETWORK_LIQUID_REGTEST
        );
        return new Destination(
            confidentialAddress,
            address,
            blindingPubkey,
            scriptPubKey
        )
    }
    getConfidentialAddress() {
        return this.confidentialAddress;
    }

    getBlindingPubkey() {
        return this.blindingPubkey;
    }

    getAddress() {
        return this.address;
    }

    getScriptPubkey() {
        return this.scriptPubkey;
    }
}
export default Destination;
