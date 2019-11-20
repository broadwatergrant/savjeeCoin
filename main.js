const { BlockChain, Transaction } = require( './blockchain' );
const EC = require( 'elliptic' ).ec;
const ec = new EC( 'secp256k1' );

const myPrivateKey = ec.keyFromPrivate( '5eb42d6d36a6926509180d0b035a909a94b8f155d691e2bb4ce9e953d9ff689b' );
const myWalletAddress = myPrivateKey.getPublic( 'hex' );
let savjeeCoin = new BlockChain();

const transaction1 = new Transaction( myWalletAddress, 'otherPublicKey', 100 );
//transaction1.signTransaction( ec.keyFromPrivate( "7d82d1c71a27741897fe1b6372aefe3b22b8cf400dc664f51b3d116ab7920ec6" ) );
transaction1.signTransaction( myPrivateKey );
savjeeCoin.addTransaction( transaction1 );

console.log( "Mining transactions..." );
savjeeCoin.minePendingTransactions( myWalletAddress );

console.log( "Balance: " + savjeeCoin.getBalanceOfAddress( myWalletAddress ) );
console.log( "Other Balance: " + savjeeCoin.getBalanceOfAddress( 'otherPublicKey' ) );
console.log( "Valid: " + savjeeCoin.isChainValid() );
console.log();

savjeeCoin.chain[1].transactions[0].amount = 1;
savjeeCoin.chain[1].transactions[0].signTransaction( myPrivateKey ); // <- Need myPrivateKey
savjeeCoin.chain[1].mineBlock( savjeeCoin.difficulty );
console.log( "Balance: " + savjeeCoin.getBalanceOfAddress( myWalletAddress ) );
console.log( "Other Balance: " + savjeeCoin.getBalanceOfAddress( 'otherPublicKey' ) );
console.log( "Valid: " + savjeeCoin.isChainValid() );
