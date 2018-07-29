const express = require('express');
const creditCard = require('../../models/clients/client.credit-car.model');
const bcrypt = require('bcrypt');
const token = require('../../middlewares/protection');
// To validate card values
let types = require('creditcards-types');
let Card = require('creditcards/card');
let expiration = require('creditcards/expiration');
let CvC = require('creditcards/cvc');
const app = express();
const crypto = require('crypto')
const algorithm = require('../../config/settings').algorithm;
const apikey = require('../../config/settings').PaymentKey;
// Sistema de guardado de tarjeta de credito para proteger estos datos
// Se usa Token, Sistemas de seguridad con Keygens de una sola vida
// HTTPS protocol
app.post('/', [token.TokenSecurity], async(request, response) => {
    let body = request.body;
    // Paso 1 Verificamos la tarjeta de credito
    let cardType = await CardType(body.credit_number);
    let validateCard = await CardValidation(body.credit_number,
        body.credit_cvc, body.credit_expiration, cardType);
    if (!validateCard) {
        return response.status(400).json({
            status: false,
            statusCode: 400,
            msg: 'Your card is invalid, please try again'
        });
    }
    // Paso 2 Verificamos si esta tarjeta ya fue tomada por algun usuario
    // Si ya esta registrada en el sistema debe rechazarla por seguridad
    try {
        let card = new creditCard({
            credit_number: encrypt(new Buffer(body.credit_number)),
            credit_cvc: encrypt(new Buffer(body.credit_cvc)),
            credit_headline: body.client_id,
            credit_address: body.credit_address,
            credit_expiration: encrypt(new Buffer(body.credit_expiration)),
            credit_type: cardType.name
        });
        card.save((err, security) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Your credit card has been saved',
                security
            });
        });
    } catch (error) {
        throw error;
    }
});
// Obtener los datos de la tarjeta para pagar automaticamente
app.get('/:card_id', [token.TokenSecurity], (request, response) => {
    let id = request.params.card_id;
    try {
        creditCard.findById(id).populate('credit_headline')
            .exec((err, Decrypted) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!Decrypted) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This card doesnt exists in our system',
                        err
                    });
                }

                response.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Your confidential payment has been loaded',
                    data: {
                        credit_number: decrypt(Decrypted.credit_number),
                        credit_cvc: decrypt(Decrypted.credit_cvc),
                        credit_expiration: decrypt(Decrypted.credit_expiration),
                    },
                    Decrypted
                });
            });
    } catch (error) {
        throw error;
    }
});
let CardType = (card) => {
    return new Promise((resolve, reject) => {
        resolve(types.find(type => type.test(card, true)));
    });
}
let CardValidation = async(cardNumber, cvc, expiration, type) => {
    let vf_card = await VerifyCard(cardNumber, type);
    let vf_cvc = await VerifyCVC(cvc, type);
    let vf_exp = await VerifyExpiration(expiration);
    if (vf_card) {
        if (vf_cvc) {
            if (vf_exp) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}
let VerifyCard = (cardNumber, type) => {
    return new Promise((resolve, reject) => {
        let card = Card([type])
        resolve(card.isValid(cardNumber));
    });
}
let VerifyCVC = (c_cvc, type) => {
    return new Promise((resolve, reject) => {
        let cvc = CvC([type]);
        resolve(cvc.isValid(c_cvc));
    });
}
let VerifyExpiration = (expNumber) => {
    return new Promise((resolve, reject) => {
        let expFormat = expNumber.split('/');
        resolve(expiration.isPast(expFormat[0], expFormat[1]));
    });
}

let encrypt = (buffer) => {
    let cipher = crypto.createCipher(algorithm, apikey)
    crypted = cipher.update(buffer, 'utf8', 'binary')
    crypted += cipher.final('binary');
    return crypted;
}

let decrypt = (buffer) => {
    let decipher = crypto.createDecipher(algorithm, apikey)
    decoded = decipher.update(buffer, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
}
module.exports = app