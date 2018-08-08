/*
Puerto de conexión 
Del cloud o en local
*/
const PORT = process.env.PORT || 3000;
// VARIABLES DE ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'developer';
/*
CONEXIÓN
*/
let Connection;
if (process.env.NODE_ENV === 'developer') {
    Connection = 'mongodb://localhost:27017/wowTow'
} else {
    Connection = process.env.MONGO_URI; // protected
}
/*
EXPIRACIÓN DEL TOKEN
*/ // 1 hora
const expires = 60 * 60
    /*
    GENERADOR DE SECRET DEL TOKEN
    */
const secretKey = process.env.MONGO_KEY || 'gjTDqiEObCZQaurTU';
// Sistema de encriptación binario para proteger datos confidenciales
const PaymentKey = process.env.CREDIT_KEY || ')36X?Q>z#twdGPw=Ao,.S/N|n~gwBx@ItTJ{F?x=I@!r#(T+9VE<!7qH{)DH2y<A{9(z3p/pp';
const algorithm = process.env.ALGORITHM || 'aes-128-cbc';
// Paypal APIKEYS
/*
SANDBOX 
*/
const PaypalSandClientId = process.env.PAYPAL_CLIENT_ID || 'ASmyBkyMcF7nwKYN6YhpHCrG1w2_BD7sF3T5E35QkPymYGFqpxBOYOkW6RgCmKBmWrwLu3ugMVOq2Tkn';
const PaypalSandSecretId = process.env.PAYPAL_SECRET_ID || 'EEa4c8F4S02NV0wMKPjL-8BjtdG_QAMF1TPezJUlgBLZibshkWezwZAlk3QuxvbzKzqSx_smh3hDmZ1N';
/*
LIVE
*/
const PaypalLiveClientId = process.env.PAYPAL_LCLIENT_ID || 'AeRwzvUjV1I04-tHgXHJ2I6BBVUixmV0eu_FDVYhNY-WLmOp2ftaQAo3BSrF-M5kCw25bZuh02j3fXgO';
const PaypalLiveSecretId = process.env.PAYPAL_LSECRET_ID || 'EF2mDdHOKAPBAJNPEk2HDfPXStw1UjcaKRBOfmoP6L-xHtIkF5dLmLOYbmDRwKEVgX1qKYgUvqtDW263';
/*
STRIPE
*/
const StripePublicKey = process.env.STRIPE_PUBLIC_KEY || 'pk_test_CAdqELuEhU4gNp3aiTsyyCTD';
const StripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dNPW5P5aMMQIxi5dPFIEIsCr';
module.exports = {
    PORT,
    Connection,
    expires,
    secretKey,
    PaymentKey,
    algorithm,
    PaypalLiveClientId,
    PaypalLiveSecretId,
    PaypalSandClientId,
    PaypalSandSecretId,
    StripePublicKey,
    StripeSecretKey
}