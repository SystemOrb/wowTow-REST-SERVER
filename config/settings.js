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
module.exports = {
    PORT,
    Connection,
    expires,
    secretKey,
    PaymentKey,
    algorithm
}