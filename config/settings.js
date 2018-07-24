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
module.exports = {
    PORT,
    Connection,
    expires,
    secretKey
}