const SHA256 = require( 'crypto-js/sha256' );

class Block {
    constructor( index, timestamp, data, previousHash ) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(
            this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify( this.data ) +
            this.nonce
        ).toString();
    }

    mineBlock( difficulty ) {
        while( this.hash.substring( 0, difficulty ) !== Array( difficulty + 1 ).join( "0" ) ) {
            ++this.nonce;
            this.hash = this.calculateHash();
        }
        return this;
    }
}

class BlockChain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;
    }

    createGenesisBlock() {
        return new Block(
            0,
            new Date().getTime(),
            "GenisisBlock",
            "0"
        )
    }

    getLatestBlock() {
        return this.chain[ this.chain.length - 1 ];
    }

    addBlock( newBlockData ) {
        this.chain.push(
            new Block(
                this.getLatestBlock().index + 1,
                new Date().getTime(),
                newBlockData,
                this.getLatestBlock().hash
            ).mineBlock( this.difficulty )
        );
    }

    isChainValid() {
        for( let i = 1; i < this.chain.length; ++i )
        {
            const currentBlock = this.chain[ i ];
            const prevBlock = this.chain[ i - 1 ];

            if( currentBlock.hash != currentBlock.calculateHash() ) {
                console.log( "Block " + currentBlock.data + " hash invalid");
                return false;
            }

            if( currentBlock.previousHash != prevBlock.hash ) {
                console.log( "Block " + currentBlock.data + " previous hash does not match");
                return false;
            }
        }
        return true;
    }

}

let savjeeCoin = new BlockChain();

console.log( "Mining block 1..." );
savjeeCoin.addBlock(
    "First added block"
);

console.log( "Mining block 2..." );
savjeeCoin.addBlock(
    "Second added block"
);

console.log( JSON.stringify( savjeeCoin, null, 4 ) );
console.log( "Is valid: " + savjeeCoin.isChainValid() );
savjeeCoin.chain[2].data = "fake data";
console.log( "Is valid: " + savjeeCoin.isChainValid() );
savjeeCoin.chain[2].hash = savjeeCoin.chain[2].calculateHash();
console.log( "Is valid: " + savjeeCoin.isChainValid() );