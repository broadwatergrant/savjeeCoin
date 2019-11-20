const SHA256 = require( 'crypto-js/sha256' );

class Transaction {
    constructor( fromAddress, toAddress, amount ) {
        this.timestamp = Date.now();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor( timestamp, transactions, previousHash ) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(
            this.previousHash +
            this.timestamp +
            JSON.stringify( this.transactions ) +
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
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createTransaction( transaction ) {
        this.pendingTransactions.push( transaction );
    }

    getBalanceOfAddress( address ) {
        let balance = 0;
        for( let block of this.chain ) {
            for( let transaction of block.transactions ) {
                if( transaction.fromAddress === address ) {
                    balance -= transaction.amount;
                } else if( transaction.toAddress === address ) {
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }

    minePendingTransactions( miningRewardAddress ) {
        let block = new Block( Date.now(), this.pendingTransactions).mineBlock( this.difficulty );
        this.chain.push( block );
        this.pendingTransactions = [ new Transaction( null, miningRewardAddress, this.miningReward ) ];
    }

    createGenesisBlock() {
        return new Block(
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

savjeeCoin.createTransaction(
    new Transaction(
        'a1', 'a2', 100
    )
);

savjeeCoin.createTransaction(
    new Transaction(
        'a2', 'a1', 50
    )
);

savjeeCoin.createTransaction(
    new Transaction(
        'a2', 'a1', 25
    )
);

console.log( "Mining transactions..." );
savjeeCoin.minePendingTransactions( 'a3' );

console.log( "a1 Balance: ", savjeeCoin.getBalanceOfAddress( 'a1' ) );
console.log( "a2 Balance: ", savjeeCoin.getBalanceOfAddress( 'a2' ) );
console.log( "a3 Balance: ", savjeeCoin.getBalanceOfAddress( 'a3' ) );

console.log( "Mining transactions..." );
savjeeCoin.minePendingTransactions( 'a3' );

console.log( "a1 Balance: ", savjeeCoin.getBalanceOfAddress( 'a1' ) );
console.log( "a2 Balance: ", savjeeCoin.getBalanceOfAddress( 'a2' ) );
console.log( "a3 Balance: ", savjeeCoin.getBalanceOfAddress( 'a3' ) );
