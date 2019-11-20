const SHA256 = require( 'crypto-js/sha256' );
const EC = require( 'elliptic' ).ec;
const ec = new EC( 'secp256k1' );

class Transaction {
    constructor( fromAddress, toAddress, amount ) {
        this.timestamp = Date.now();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(
            this.fromAddress +
            this.toAddress +
            this.amount
        ).toString();
    }

    signTransaction( signingKey ) {
        if( signingKey.getPublic( 'hex' ) !== this.fromAddress ) {
            throw "Invalid signature";
        }
        const transactionHash = this.calculateHash();
        const signature = signingKey.sign( transactionHash, 'base64' );
        this.signature = signature.toDER( 'hex' );
    }

    isValid() {
        if( this.fromAddress === null ) {
            return true;
        }

        if( !this.signature || this.signature.length === 0 ) {
            throw "No signature";
        }

        const publicKey = ec.keyFromPublic( this.fromAddress, 'hex' );



        let valid = publicKey.verify( this.calculateHash(), this.signature );

        return valid;
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
        do {
            ++this.nonce;
            this.hash = this.calculateHash();
        } while( this.hash.substring( 0, difficulty ) !== Array( difficulty + 1 ).join( "0" ) );
        return this;
    }

    hasValidTransactions() {
        for( const transaction of this.transactions ) {
            if( !transaction.isValid() ) {
                return false;
            }
        }
        return true;
    }
}

class BlockChain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    addTransaction( transaction ) {

        if( !transaction.fromAddress || !transaction.toAddress ) {
            throw "Transaction not complete";
        }

        if( !transaction.isValid() ) {
            throw "Transaction invalid";
        }

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
        let block = new Block( Date.now(), this.pendingTransactions, this.getLatestBlock().hash).mineBlock( this.difficulty );
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

                return false;
            }

            if( currentBlock.previousHash != prevBlock.hash ) {

                return false;
            }

            if( !currentBlock.hasValidTransactions() ) {

                return false;
            }
        }
        return true;
    }

}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;