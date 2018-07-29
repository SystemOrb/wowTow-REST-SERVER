// Modelo para registrar los datos privados de los clientes
// Debe tener un sistema de seguridad con Tokens y Sistemas de encriptación con HASH
const moongose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = moongose.Schema;
const creditCard = new Schema({
    credit_number: {
        type: String,
        unique: true,
        required: true
    },
    credit_cvc: {
        type: String,
        required: true,
        unique: true
    },
    credit_headline: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    credit_address: {
        type: String,
        required: true
    },
    credit_expiration: {
        type: String,
        required: true
    },
    credit_type: {
        type: String,
        required: true,
        enum: {
            values: ['Mastercard', 'Visa', 'Maestro', 'American Express', 'Discover', 'JCB', 'UnionPay'],
            message: '{VALUE} payment method is incorrect'
        }
    }
});
creditCard.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});
module.exports = moongose.model('client_cards', creditCard);